module.exports = {
  isDevel: true,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['en', 'es', 'zh', 'sw'],
  mainDomain: '<%= LA_domain %>', // used for cookies (without http/https)
  mainLAUrl: '<%= LA_urls_prefix %><%= LA_domain %>',
  baseFooterUrl: '<%= LA_urls_prefix %><%= LA_domain %>',
  services: {
    collectory: { url: '<%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>', title: 'Collections' },
    biocache: { url: '<%= LA_urls_prefix %><%= LA_ala_bie_url %>', title: 'Occurrence records' },
    biocacheService: { url: '<%= LA_urls_prefix %><%= LA_biocache_service_url %><%= LA_biocache_service_path %>', title: 'Occurrence records webservice' },
    bie: { url: '<%= LA_urls_prefix %><%= LA_ala_bie_url %><%= LA_ala_bie_path %>', title: 'Species' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: '<%= LA_urls_prefix %><%= LA_bie_index_url %><%= LA_bie_index_path %>', title: 'Species webservice' },
    regions: { url: '<%= LA_urls_prefix %><%= LA_regions_url %><%= LA_regions_path %>', title: 'Regions' },
    <%_ if (LA_use_species_lists) { _%>
    lists: { url: '<%= LA_urls_prefix %><%= LA_lists_url %><%= LA_lists_path %>', title: 'Species List' },
    <%_ } else { _%>
    lists: { url: 'https://lists.ala.org.au', title: 'Species List' },
    <%_ } _%>
    <%_ if (LA_use_spatial) { _%>
    spatial: { url: '<%= LA_urls_prefix %><%= LA_spatial_url %>', title: 'Spatial Portal' },
    <%_ } else { _%>
    spatial: { url: 'https://spatial.ala.org.au', title: 'Spatial Portal' },
    <%_ } _%>
    images: { url: '<%= LA_urls_prefix %><%= LA_images_url %><%= LA_images_path %>', title: 'Images Service' },
    cas: { url: '<%= LA_urls_prefix %><%= LA_cas_url %>', title: 'CAS' }
  },
  otherLinks: [
    { title: 'Datasets', url: '<%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>/datasets' },
    { title: 'Explore your area', url: '<%= LA_urls_prefix %><%= LA_ala_hub_url %><%= LA_ala_hub_path %>/explore/your-area/' },
    { title: 'twitter', url: '', icon: 'twitter' }
  ]
}
