module.exports = {
  isDevel: true,
  inMante: false, // set to true and deploy if you want to set a maintenance message in all the services
  enabledLangs: ['en', 'es', 'zh', 'sw'],
  mainDomain: '<%= LA_domain %>', // used for cookies (without http/https)
  mainLAUrl: '<%= LA_urls_prefix %><%= LA_domain %>',
  baseFooterUrl: '<%= LA_urls_prefix %><%= LA_domain %>',
  services: {
    collectory: { url: '<%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>', title: 'Collections' },
    biocache: { url: '<%= LA_urls_prefix %><%= LA_ala_hub_url %><%= LA_ala_hub_path %>', title: 'Occurrence records' },
    biocacheService: { url: '<%= LA_urls_prefix %><%= LA_biocache_service_url %><%= LA_biocache_service_path %>', title: 'Occurrence records webservice' },
    <%_ if (LA_use_species) { _%>
    bie: { url: '<%= LA_urls_prefix %><%= LA_ala_bie_url %><%= LA_ala_bie_path %>', title: 'Species' },
    // This bieService var is used by the search autocomplete. With your BIE
    bieService: { url: '<%= LA_urls_prefix %><%= LA_bie_index_url %><%= LA_bie_index_path %>', title: 'Species webservice' },
    <%_ } else { _%>
    bie: { url: 'https://bie.ala.org.au', title: 'Species' },
    bieService: { url: 'https://bie.ala.org.au/ws', title: 'Species webservice' },
    <%_ } _%>
    <%_ if (LA_use_regions) { _%>
    regions: { url: '<%= LA_urls_prefix %><%= LA_regions_url %><%= LA_regions_path %>', title: 'Regions' },
    <%_ } else { _%>
    regions: { url: 'https://regions.ala.org.au', title: 'Regions' },
    <%_ } _%>
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
    <%_ if (LA_use_images) { _%>
    images: { url: '<%= LA_urls_prefix %><%= LA_images_url %><%= LA_images_path %>', title: 'Images Service' },
    <%_ } else { _%>
    images: { url: 'https://images.ala.org.au', title: 'Images Service' },
    <%_ } _%>
    <%_ if (LA_use_CAS) { _%>
    cas: { url: '<%= LA_urls_prefix %><%= LA_cas_url %>', title: 'CAS' }
    <%_ } else { _%>
    cas: { url: 'https://auth.ala.org.au/cas/', title: 'CAS' }
    <%_ } _%>
  },
  otherLinks: [
    { title: 'Datasets', url: '<%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>/datasets' },
    { title: 'Explore your area', url: '<%= LA_urls_prefix %><%= LA_ala_hub_url %><%= LA_ala_hub_path %>/explore/your-area/' },
    { title: 'twitter', url: '', icon: 'twitter' }
  ]
}
