# Diseño: lectura de variables por grupos en la-docker-compose sin bulk-loads

Fase 2 (no implementada aún). Contexto y decisión de diseño acordada en julio de 2026.

## Problema

En VMs (ala-install) la asociación *playbook → host-group → role* hace que Ansible
entregue a cada play exactamente las variables del grupo del servicio. En
la-docker-compose todo se genera desde **un único play** que corre en el host
`docker_compose`, así que las variables de los grupos de servicio (que viven en los
aliases `<host>.<servicio>` del inventario, ver issue #10 del generador) no llegan
solas: hay que ir a buscarlas con `hostvars[...]` y `set_fact`, lo que ha producido
mecanismos difíciles de leer y mantener.

### Inventario de los mecanismos actuales (julio 2026)

En `roles/la-compose/tasks/setup-facts.yml`:

- `physical_server_groups`: bucle Jinja sobre `groups['all']` comparando
  `ansible_host` para descubrir los grupos co-ubicados en la máquina (líneas 22-39).
- `services_enabled`: derivado de `physical_server_groups` × `docker_services_desc`
  (líneas 41-52), más `skip_services` (54-79).
- `enable_mysql`/`enable_postgres`/`enable_mongo`: listas manuales de grupos (81-109).
- `service_aliases`: mapa grupo → alias, con regex `'^' + ansible_host + '(\..+)?$'`
  sobre una lista **hardcodeada** de 18 grupos (111-135). Acepta tanto nombre desnudo
  como alias (compatibilidad con ambas formas del inventario).
- `Normalize database hostnames`: ~25 variables reescritas a hostnames docker
  (mysql/postgres/la_mongodb/solr/cassandra/postfix/mailhog) (137-195).
- `nginx_shared_vhost_service_keys`: clusters de subdominios compartidos (197-226).

En `roles/la-compose/tasks/generate-compose.yml`:

- "Bulk load CAS-related variables from service alias context": vuelca TODOS los
  hostvars del alias `cas-servers` como facts del play (con blacklist de claves de
  sistema), y después "Re-normalize database hostnames after CAS bulk load" tiene que
  volver a ejecutar normalize-hostnames.yml porque el volcado pisa lo normalizado.
  Este patrón (volcar + re-normalizar) es el más frágil: el orden importa y cada
  bulk-load puede deshacer lo anterior.
- "Collect nginx_other_log_formats from co-located service groups": otro bucle Jinja
  sobre `groups['all']` × `ansible_host` para hacer unión de una variable definida en
  distintos grupos de servicio (líneas ~630-653). Existe porque nginx.conf se
  renderiza en el scope general, que no carga los vars de los grupos.
- Varios ajustes puntuales de hostvars de alias ("alias hostvars carry the VM
  default...", "alias hostvars may carry the raw inventory value...").

## Diseño propuesto: plays por host-group, ensamblado final

Estructurar `playbooks/site.yml` como ala-install: **un play por grupo de servicio**,
ejecutando en el alias del servicio con `connection: local`. Dentro de cada play,
Ansible entrega las vars del grupo de forma nativa: desaparecen `service_aliases`,
los bulk-loads y las re-normalizaciones.

```yaml
# site.yml (esquema)
- hosts: docker_compose
  roles: [la-compose/setup]        # facts de máquina: services_enabled, redes, dirs

- hosts: cas-servers               # ← el alias localhost.cas / <host>.cas
  connection: local
  roles: [la-compose/service-fragment]   # vars del grupo YA en scope
  vars: { la_service_key: cas }

- hosts: collectory
  connection: local
  roles: [la-compose/service-fragment]
  vars: { la_service_key: collectory }

# ... un play por grupo (generable desde docker-services-desc.yaml) ...

- hosts: docker_compose            # ensamblado: lo único legítimamente cross-service
  roles: [la-compose/assemble]     # compose.yml, nginx.conf, redes, healthchecks
```

Puntos clave:

1. **service-fragment**: cada play renderiza SU fragmento de docker-compose
   (`fragments/<servicio>.yml`), sus ficheros de config y su vhost nginx, usando las
   vars del grupo directamente (`{{ cas_db_hostname }}`, sin `hostvars[]`).
   La normalización de hostnames docker (mysql/postgres/…) se convierte en un
   include pequeño por play, o mejor: vars de grupo en un `group_vars/all` del
   playbook con `default()` encadenados.
2. **assemble**: el play final concatena fragmentos y calcula lo genuinamente
   cross-service, que es poco: `nginx_other_log_formats` (unión de fragmentos:
   cada service-fragment deja su lista en un fichero/fact registrado, el assemble
   las une — sin bucles sobre hostvars), `depends_on`, redes y el orden de arranque.
3. **connection: local + delegación de escritura**: todos los plays escriben en el
   mismo árbol de salida del host docker_compose (`hostvars[groups['docker_compose'][0]].la_output_dir`
   o simplemente la misma ruta, ya que todo es local).
4. Los inventarios del generador **no cambian**: los aliases actuales son
   exactamente lo que estos plays necesitan. `[la_pre_deploy_hosts]` (identidad de
   máquina, v1.8.31) queda para tareas de máquina.
5. `services_enabled`/`physical_server_groups` se conservan solo en el play de
   setup (siguen siendo útiles para decidir qué plays hacen algo), pero pueden
   simplificarse leyendo la pertenencia a grupos (`group_names`) en cada play en
   lugar de reconstruirla con bucles sobre `groups['all']`.

## Mapa de migración

| Mecanismo actual | Destino |
|---|---|
| `service_aliases` + bulk-loads (`hostvars[service_aliases[...]]`) | eliminado — vars nativas en el play del grupo |
| "Bulk load CAS-related variables" + re-normalización | play `cas-servers` |
| `Normalize database hostnames` (set_fact global, 25 vars) | include por play o defaults de group_vars |
| unión de `nginx_other_log_formats` sobre `groups['all']` | assemble: unión de lo registrado por cada fragmento |
| `physical_server_groups` (bucle Jinja) | setup: se puede derivar de `groups` directamente |
| `nginx_shared_vhost_service_keys` | setup (sin cambios de fondo) |
| ajustes puntuales de hostvars de alias | eliminados (el scope del play ya es el alias) |

## Migración incremental sugerida

1. Extraer `service-fragment` para UN servicio simple (p.ej. `logger-service`) y
   ejecutarlo como play propio manteniendo el resto igual; comparar la salida
   (`diff` de compose.yml y configs) en `la-docker-compose-tests`.
2. Migrar servicios de uno en uno (los tests de Jenkins comparan salida en cada PR).
3. Migrar CAS al final (es el que más depende del bulk-load) y borrar entonces
   `service_aliases` y las re-normalizaciones.
4. Assemble: mover nginx.conf y compose.yml al play final; borrar el union-loop.

## Riesgos

- Orden de plays: Ansible ejecuta plays secuencialmente — el assemble debe ser el
  último y los fragments no deben depender entre sí (hoy sí hay dependencias CAS →
  resto vía bulk-load; revisar qué variables cruzadas se usan de verdad).
- `set_fact` es por-host: los facts registrados en el alias `localhost.cas` no se ven
  desde `docker_compose` salvo vía `hostvars` — el traspaso fragment→assemble debe
  hacerse por ficheros generados (preferible) o `hostvars` puntual y documentado.
- Rendimiento: N plays con gather_facts off y connection local es barato.
