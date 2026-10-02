// signals network map — app logic, split out of index.html so it's not a nightmare to find stuff
// added: close all + select all buttons on the filters, hover tooltip w/ org name, and calvin's slower/hover-paused rotation

(function(){
  "use strict";

  // 1. DATA — this is the real dataset now (136 orgs, 16 sectors), edit the arrays below if TLaWC sends updates
  var CATEGORIES = [
    { id:"govtier", label:"Government by Tier", color:"--cat-govtier", hex:"#CF5959" },
    { id:"housing", label:"Housing", color:"--cat-housing", hex:"#C66E39" },
    { id:"media", label:"Media", color:"--cat-media", hex:"#CFB159" },
    { id:"culture", label:"Culture and Art", color:"--cat-culture", hex:"#B4C639" },
    { id:"welfare", label:"Social Welfare", color:"--cat-welfare", hex:"#94CF59" },
    { id:"business", label:"Business", color:"--cat-business", hex:"#4BC639" },
    { id:"education", label:"Education", color:"--cat-education", hex:"#59CF76" },
    { id:"politics", label:"Politics", color:"--cat-politics", hex:"#39C691" },
    { id:"innovation", label:"Innovation", color:"--cat-innovation", hex:"#59CFCF" },
    { id:"fn-national", label:"First Nations \u2014 National Peak Bodies", color:"--cat-fn-national", hex:"#3991C6" },
    { id:"fn-uluru", label:"First Nations \u2014 Uluru Statement, Voice and Treaty", color:"--cat-fn-uluru", hex:"#5976CF" },
    { id:"fn-truth", label:"First Nations \u2014 Truth-telling Bodies", color:"--cat-fn-truth", hex:"#4B39C6" },
    { id:"fn-land", label:"First Nations \u2014 Land Councils and Traditional Owner Bodies", color:"--cat-fn-land", hex:"#9459CF" },
    { id:"design-studios", label:"Design Studios and Niche Policy Consultancies", color:"--cat-design-studios", hex:"#B439C6" },
    { id:"policy-labs", label:"Policy Activist Groups and Design Labs", color:"--cat-policy-labs", hex:"#CF59B1" },
    { id:"events", label:"Conferences and Events", color:"--cat-events", hex:"#C6396E" }
  ];

  var NODES = [
    {id:"office-of-the-victorian-government-architect-ovga",name:"Office of the Victorian Government Architect (OVGA)",category:"govtier",role:"Local Government",description:"Statutory design advisory body working across local government and state; connects design practitioners and strategy teams to place-based and policy design practice in Victoria",url:"https://ovga.vic.gov.au",contact:"ovga@ovga.vic.gov.au",tag2:null,connections:[]},
    {id:"mav-lab-municipal-association-of-victoria",name:"MAV LAB (Municipal Association of Victoria)",category:"govtier",role:"Local Government",description:"Local government innovation and design lab, run through the peak body for Victorian councils",url:"https://www.mav.asn.au/mavlab",contact:"Contact via website",tag2:null,connections:[]},
    {id:"parliamentary-library-media-policy-and-regulation-quick-guide",name:"Parliamentary Library \u2014 Media Policy and Regulation Quick Guide",category:"govtier",role:"Federal",description:"APS research resource summarising the federal media policy and regulatory landscape; a standing reference point rather than an organisation",url:"https://www.aph.gov.au",contact:"Not applicable \u2014 parliamentary research service",tag2:null,connections:[]},
    {id:"community-housing-industry-association-chia",name:"Community Housing Industry Association (CHIA)",category:"housing",role:"Peak Body",description:"National peak body for the community housing sector",url:"https://chia.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"homelessness-australia",name:"Homelessness Australia",category:"housing",role:"Peak Body",description:"National peak body for homelessness services, systemic advocacy",url:"https://homelessnessaustralia.org.au",contact:"admin@homelessnessaustralia.org.au",tag2:null,connections:[]},
    {id:"national-shelter",name:"National Shelter",category:"housing",role:"Peak Body",description:"National peak body on housing affordability and homelessness policy",url:"https://shelter.org.au",contact:"admin@shelter.org.au",tag2:null,connections:[]},
    {id:"property-council-of-australia",name:"Property Council of Australia",category:"housing",role:"Peak Body",description:"Peak body for the property investment and development industry",url:"https://www.propertycouncil.com.au",contact:"info@propertycouncil.com.au",tag2:null,connections:[]},
    {id:"housing-industry-association-hia",name:"Housing Industry Association (HIA)",category:"housing",role:"Peak Body",description:"Peak body for the residential building industry",url:"https://hia.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"real-estate-institute-of-australia-reia",name:"Real Estate Institute of Australia (REIA)",category:"housing",role:"Peak Body",description:"National peak body for the real estate profession",url:"https://reia.com.au",contact:"reia@reia.com.au",tag2:null,connections:[]},
    {id:"council-to-homeless-persons",name:"Council to Homeless Persons",category:"housing",role:"Peak Body",description:"Victorian peak body on homelessness",url:"https://chp.org.au",contact:"admin@chp.org.au",tag2:null,connections:[]},
    {id:"national-aboriginal-and-torres-strait-islander-housing-association-natsiha",name:"National Aboriginal and Torres Strait Islander Housing Association (NATSIHA)",category:"housing",role:"Peak Body",description:"Peak body for Indigenous housing, co-chairs the national Housing Policy Partnership with Treasury",url:"https://natsiha.org.au",contact:"Contact via website",tag2:"Also listed under First Nations \u2014 National Peak Bodies",connections:[]},
    {id:"australian-housing-and-urban-research-institute-ahuri",name:"Australian Housing and Urban Research Institute (AHURI)",category:"housing",role:"Research",description:"Independent national research network on housing, homelessness and cities policy",url:"https://www.ahuri.edu.au",contact:"information@ahuri.edu.au",tag2:null,connections:[]},
    {id:"ahuri-professional-services",name:"AHURI Professional Services",category:"housing",role:"Research",description:"Consulting and advisory arm of AHURI, applying housing policy research directly for government and industry clients",url:"https://www.ahuri.edu.au",contact:"information@ahuri.edu.au",tag2:null,connections:[]},
    {id:"prosper-australia",name:"Prosper Australia",category:"housing",role:"Advocacy",description:"Land value tax and housing affordability advocacy, Melbourne-based",url:"https://www.prosper.org.au",contact:"info@prosper.org.au",tag2:null,connections:[]},
    {id:"everybody-s-home",name:"Everybody's Home",category:"housing",role:"Advocacy",description:"National campaign coalition for affordable housing",url:"https://everybodyshome.com.au",contact:"Contact via website",tag2:null,connections:["mission-australia","australian-council-of-social-service-acoss","council-to-homeless-persons","national-shelter","homelessness-australia","better-renting"]},
    {id:"better-renting",name:"Better Renting",category:"housing",role:"Advocacy",description:"Renter advocacy and research",url:"https://www.betterrenting.org.au",contact:"hello@betterrenting.org.au",tag2:null,connections:[]},
    {id:"australian-press-council",name:"Australian Press Council",category:"media",role:"Regulation / Self-regulation",description:"Standards and complaints body for print and online news",url:"https://www.presscouncil.org.au",contact:"info@presscouncil.org.au",tag2:null,connections:[]},
    {id:"free-tv-australia",name:"Free TV Australia",category:"media",role:"Peak Body",description:"Commercial free-to-air television peak body",url:"https://www.freetv.com.au",contact:"info@freetv.com.au",tag2:null,connections:[]},
    {id:"commercial-radio-audio-cra",name:"Commercial Radio & Audio (CRA)",category:"media",role:"Peak Body",description:"Peak body for commercial radio and audio broadcasters",url:"https://www.cra.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"media-entertainment-arts-alliance-meaa",name:"Media, Entertainment & Arts Alliance (MEAA)",category:"media",role:"Union / Professional Body",description:"Union and professional body for journalists and media workers",url:"https://www.meaa.org",contact:"eastern@meaa.org",tag2:null,connections:[]},
    {id:"public-interest-journalism-initiative-piji",name:"Public Interest Journalism Initiative (PIJI)",category:"media",role:"Policy / Research",description:"Melbourne-based research and policy institute on news sustainability",url:"https://piji.com.au",contact:"info@piji.com.au",tag2:null,connections:[]},
    {id:"centre-for-media-transition-uts",name:"Centre for Media Transition, UTS",category:"media",role:"Research",description:"University research centre on media policy and regulation",url:"https://www.uts.edu.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"local-independent-news-association-lina",name:"Local & Independent News Association (LINA)",category:"media",role:"Advocacy / Industry",description:"Advocacy and support body for independent and local newsrooms",url:"https://lina.org.au",contact:"hello@lina.org.au",tag2:null,connections:[]},
    {id:"country-press-australia",name:"Country Press Australia",category:"media",role:"Advocacy / Industry",description:"Regional press advocacy body",url:"https://countrypress.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"digital-rights-watch",name:"Digital Rights Watch",category:"media",role:"Advocacy",description:"Advocacy on platform regulation, surveillance and online rights",url:"https://digitalrightswatch.org.au",contact:"contact@digitalrightswatch.org.au",tag2:null,connections:[]},
    {id:"australian-communications-and-media-authority-acma",name:"Australian Communications and Media Authority (ACMA)",category:"media",role:"Regulator",description:"Federal statutory regulator for media, broadcasting and communications content standards",url:"https://www.acma.gov.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"the-mandarin",name:"The Mandarin",category:"media",role:"Publication",description:"Independent online publication covering Australian public sector policy and governance news",url:"https://www.themandarin.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"artspeak",name:"ArtsPeak",category:"culture",role:"Peak Federation",description:"Federation of national peak arts organisations coordinating sector-wide policy positions",url:"https://ausdance.org.au/network/details/artspeak",contact:"Contact via website",tag2:null,connections:["national-association-for-the-visual-arts-nava","regional-arts-australia","national-advocates-for-arts-education-naae","australian-museums-and-galleries-association-amaga","theatre-network-australia","ausdance","australian-society-of-authors"]},
    {id:"national-association-for-the-visual-arts-nava",name:"National Association for the Visual Arts (NAVA)",category:"culture",role:"Peak Body",description:"Peak body for visual arts, craft and design; runs #VoteForArt policy campaigns",url:"https://visualarts.net.au",contact:"nava@visualarts.net.au",tag2:null,connections:[]},
    {id:"regional-arts-australia",name:"Regional Arts Australia",category:"culture",role:"Peak Body",description:"Peak body for regional, rural and remote arts",url:"https://www.regionalarts.com.au",contact:"admin@regionalarts.com.au",tag2:null,connections:[]},
    {id:"national-advocates-for-arts-education-naae",name:"National Advocates for Arts Education (NAAE)",category:"culture",role:"Peak Body",description:"Peak advocacy and research body for arts education",url:"https://naae.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-museums-and-galleries-association-amaga",name:"Australian Museums and Galleries Association (AMaGA)",category:"culture",role:"Peak Body",description:"Peak body for the museums and galleries sector",url:"https://amaga.org.au",contact:"office@amaga.org.au",tag2:null,connections:[]},
    {id:"theatre-network-australia",name:"Theatre Network Australia",category:"culture",role:"Peak Body",description:"Peak body for the independent performing arts sector",url:"https://tna.org.au",contact:"admin@tna.org.au",tag2:null,connections:[]},
    {id:"ausdance",name:"Ausdance",category:"culture",role:"Peak Body",description:"National dance advocacy organisation",url:"https://ausdance.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-society-of-authors",name:"Australian Society of Authors",category:"culture",role:"Peak Body",description:"Peak professional body for writers",url:"https://www.asauthors.org",contact:"asa@asauthors.org",tag2:null,connections:[]},
    {id:"creative-australia",name:"Creative Australia",category:"culture",role:"Statutory",description:"Principal Commonwealth arts investment, research and advocacy body; delivers the National Cultural Policy (Revive). Formerly the Australia Council for the Arts",url:"https://creative.gov.au",contact:"enquiries@creative.gov.au",tag2:null,connections:[]},
    {id:"a-new-approach-ana",name:"A New Approach (ANA)",category:"culture",role:"Policy / Think Tank",description:"Arts and culture policy think tank, hosted by the Australian Academy of the Humanities",url:"https://www.humanities.org.au/a-new-approach",contact:"Contact via website",tag2:null,connections:[]},
    {id:"test-pattern",name:"Test Pattern",category:"culture",role:"Publication",description:"Independent publication and platform covering Australian design and cultural policy",url:"https://testpattern.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-council-of-social-service-acoss",name:"Australian Council of Social Service (ACOSS)",category:"welfare",role:"Peak Body",description:"Principal national peak for the social and community services sector",url:"https://www.acoss.org.au",contact:"info@acoss.org.au",tag2:null,connections:["vcoss","ncoss","qcoss"]},
    {id:"vcoss",name:"VCOSS",category:"welfare",role:"Peak Body (State)",description:"Victorian peak body for the social and community sector",url:"https://vcoss.org.au",contact:"vcoss@vcoss.org.au",tag2:null,connections:[]},
    {id:"ncoss",name:"NCOSS",category:"welfare",role:"Peak Body (State)",description:"NSW peak body for the social and community sector",url:"https://www.ncoss.org.au",contact:"info@ncoss.org.au",tag2:null,connections:[]},
    {id:"qcoss",name:"QCOSS",category:"welfare",role:"Peak Body (State)",description:"Queensland peak body for the social and community sector",url:"https://www.qcoss.org.au",contact:"qcoss@qcoss.org.au",tag2:null,connections:[]},
    {id:"national-disability-services-nds",name:"National Disability Services (NDS)",category:"welfare",role:"Peak Body",description:"Peak body for non-government disability services",url:"https://www.nds.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"early-childhood-australia-eca",name:"Early Childhood Australia (ECA)",category:"welfare",role:"Peak Body",description:"National peak body for early childhood education and care",url:"https://www.earlychildhoodaustralia.org.au",contact:"eca@earlychildhood.org.au",tag2:null,connections:[]},
    {id:"australian-youth-affairs-coalition-ayac",name:"Australian Youth Affairs Coalition (AYAC)",category:"welfare",role:"Peak Body",description:"National peak body for young people and the youth sector",url:"https://ayac.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"youth-action",name:"Youth Action",category:"welfare",role:"Peak Body (State)",description:"NSW peak body for young people and youth services",url:"https://www.youthaction.org.au",contact:"admin@youthaction.org.au",tag2:null,connections:[]},
    {id:"diversity-council-australia-dca",name:"Diversity Council Australia (DCA)",category:"welfare",role:"Peak Body",description:"Independent peak body for workplace diversity and inclusion",url:"https://www.dca.org.au",contact:"enquiries@dca.org.au",tag2:null,connections:[]},
    {id:"brotherhood-of-st-laurence",name:"Brotherhood of St Laurence",category:"welfare",role:"Research / Service Provider",description:"Social policy research and service delivery organisation",url:"https://www.bsl.org.au",contact:"info@bsl.org.au",tag2:null,connections:[]},
    {id:"anglicare-australia",name:"Anglicare Australia",category:"welfare",role:"Service Provider",description:"National network with active social policy and research function",url:"https://www.anglicare.asn.au",contact:"anglicare@anglicare.asn.au",tag2:null,connections:[]},
    {id:"unitingcare-australia",name:"UnitingCare Australia",category:"welfare",role:"Service Provider",description:"National network with active social policy function",url:"https://www.unitingcare.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"mission-australia",name:"Mission Australia",category:"welfare",role:"Service Provider",description:"Major service provider with active policy and research arm",url:"https://www.missionaustralia.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-council-of-trade-unions-actu",name:"Australian Council of Trade Unions (ACTU)",category:"welfare",role:"Peak Body / Union",description:"Peak union body, active in social and industrial policy",url:"https://www.actu.org.au",contact:"actu@actu.org.au",tag2:null,connections:["australian-education-union-aeu"]},
    {id:"national-council-of-single-mothers-and-their-children",name:"National Council of Single Mothers and their Children",category:"welfare",role:"Advocacy",description:"Advocacy body for single mothers and their children",url:"https://www.ncsmc.org.au",contact:"ncsmc@ncsmc.org.au",tag2:null,connections:[]},
    {id:"health-justice-australia",name:"Health Justice Australia",category:"welfare",role:"Advocacy",description:"National centre for health justice partnerships",url:"https://www.healthjustice.org.au",contact:"info@healthjustice.org.au",tag2:null,connections:[]},
    {id:"business-council-of-australia-bca",name:"Business Council of Australia (BCA)",category:"business",role:"Peak Body",description:"Peak body for large corporations; leads the Alliance of Industry Associations",url:"https://www.bca.com.au",contact:"Contact via website",tag2:null,connections:["alliance-of-industry-associations"]},
    {id:"australian-chamber-of-commerce-and-industry-acci",name:"Australian Chamber of Commerce and Industry (ACCI)",category:"business",role:"Peak Body",description:"Umbrella body for chambers of commerce and industry associations",url:"https://acci.com.au",contact:"info@acci.com.au",tag2:null,connections:[]},
    {id:"australian-industry-group-ai-group",name:"Australian Industry Group (Ai Group)",category:"business",role:"Peak Body",description:"Peak body for manufacturing and industry employers",url:"https://www.aigroup.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"council-of-small-business-organisations-australia-cosboa",name:"Council of Small Business Organisations Australia (COSBOA)",category:"business",role:"Peak Body",description:"National peak body for small business",url:"https://www.cosboa.org.au",contact:"admin@cosboa.org.au",tag2:null,connections:[]},
    {id:"financial-services-council-fsc",name:"Financial Services Council (FSC)",category:"business",role:"Peak Body",description:"Peak body for superannuation, funds management and life insurance",url:"https://www.fsc.org.au",contact:"info@fsc.org.au",tag2:null,connections:[]},
    {id:"australian-banking-association",name:"Australian Banking Association",category:"business",role:"Peak Body",description:"Peak body for Australia's banks",url:"https://www.ausbanking.org.au",contact:"contact@ausbanking.org.au",tag2:null,connections:[]},
    {id:"committee-for-economic-development-of-australia-ceda",name:"Committee for Economic Development of Australia (CEDA)",category:"business",role:"Research",description:"Cross-sector economic policy research and forums body",url:"https://www.ceda.com.au",contact:"info@ceda.com.au",tag2:"Also listed under Innovation",connections:[]},
    {id:"alliance-of-industry-associations",name:"Alliance of Industry Associations",category:"business",role:"Coalition",description:"Coalition of business, education, agriculture and energy peaks on productivity reform, led by the BCA",url:"https://www.bca.com.au/our-initiatives/alliance-of-industry-associations",contact:"Contact via website",tag2:null,connections:["australian-chamber-of-commerce-and-industry-acci","australian-industry-group-ai-group","council-of-small-business-organisations-australia-cosboa"]},
    {id:"universities-australia",name:"Universities Australia",category:"education",role:"Peak Body",description:"Peak body for the university sector",url:"https://universitiesaustralia.edu.au",contact:"contact@universitiesaustralia.edu.au",tag2:null,connections:[]},
    {id:"independent-schools-australia-isa",name:"Independent Schools Australia (ISA)",category:"education",role:"Peak Body",description:"Peak body for the independent schools sector",url:"https://isa.edu.au",contact:"isa@isa.edu.au",tag2:null,connections:[]},
    {id:"australian-education-union-aeu",name:"Australian Education Union (AEU)",category:"education",role:"Union / Advocacy",description:"Union and advocacy body for public education staff",url:"https://www.aeufederal.org.au",contact:"aeu@aeufederal.org.au",tag2:null,connections:[]},
    {id:"tafe-directors-australia",name:"TAFE Directors Australia",category:"education",role:"Peak Body",description:"Peak body for public vocational education providers",url:"https://tda.edu.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-council-for-educational-research-acer",name:"Australian Council for Educational Research (ACER)",category:"education",role:"Research",description:"Independent research body with strong policy influence",url:"https://www.acer.org",contact:"enquiries@acer.org",tag2:null,connections:[]},
    {id:"mitchell-institute-victoria-university",name:"Mitchell Institute, Victoria University",category:"education",role:"Research",description:"Education and health policy research institute",url:"https://www.vu.edu.au/mitchell-institute",contact:"mitchell.institute@vu.edu.au",tag2:null,connections:[]},
    {id:"australian-association-for-research-in-education-aare",name:"Australian Association for Research in Education (AARE)",category:"education",role:"Peak Body",description:"Peak association of education researchers; runs the annual AARE Conference",url:"https://www.aare.edu.au",contact:"office@aare.edu.au",tag2:null,connections:[]},
    {id:"australian-democracy-network-adn",name:"Australian Democracy Network (ADN)",category:"politics",role:"Advocacy Coalition",description:"Coalition body running the #OurDemocracy and Fair Democracy campaigns on donations, transparency and lobbying reform",url:"https://australiandemocracy.org.au",contact:"Contact via website",tag2:null,connections:["human-rights-law-centre","australian-council-of-social-service-acoss"]},
    {id:"getup",name:"GetUp!",category:"politics",role:"Activist",description:"Progressive campaigning organisation active on democracy, environment and human rights",url:"https://www.getup.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"human-rights-law-centre",name:"Human Rights Law Centre",category:"politics",role:"Legal Advocacy",description:"Legal advocacy centre active in democracy and rights campaigns",url:"https://www.hrlc.org.au",contact:"info@hrlc.org.au",tag2:null,connections:["getup"]},
    {id:"proportional-representation-society-of-australia",name:"Proportional Representation Society of Australia",category:"politics",role:"Advocacy",description:"Long-standing electoral system reform body",url:"http://www.prsa.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"the-australia-institute",name:"The Australia Institute",category:"politics",role:"Think Tank",description:"Progressive-leaning think tank with a Democracy & Accountability Program",url:"https://australiainstitute.org.au",contact:"mail@australiainstitute.org.au",tag2:null,connections:[]},
    {id:"grattan-institute",name:"Grattan Institute",category:"politics",role:"Think Tank",description:"Cross-partisan policy think tank, publishes the Orange Book series ahead of elections",url:"https://grattan.edu.au",contact:"contact@grattan.edu.au",tag2:null,connections:[]},
    {id:"centre-for-policy-development-cpd",name:"Centre for Policy Development (CPD)",category:"politics",role:"Think Tank",description:"Public policy think tank, Sydney and Melbourne",url:"https://cpd.org.au",contact:"info@cpd.org.au",tag2:null,connections:[]},
    {id:"chifley-research-centre",name:"Chifley Research Centre",category:"politics",role:"Think Tank (Party-aligned)",description:"Labor-aligned policy institute",url:"https://www.chifley.org.au",contact:"admin@chifley.org.au",tag2:null,connections:[]},
    {id:"menzies-research-centre",name:"Menzies Research Centre",category:"politics",role:"Think Tank (Party-aligned)",description:"Liberal-aligned policy institute",url:"https://www.menziesrc.org",contact:"admin@menziesrc.org",tag2:null,connections:[]},
    {id:"australian-electoral-commission-aec",name:"Australian Electoral Commission (AEC)",category:"politics",role:"Statutory",description:"Statutory body, not an advocacy organisation, but central to electoral reform debate",url:"https://www.aec.gov.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"tech-policy-design-institute-tpdi",name:"Tech Policy Design Institute (TPDi)",category:"innovation",role:"Policy Design / Research",description:"Canberra-based multi-stakeholder tech policy design and research institute, evolved from the ANU Tech Policy Design Centre",url:"https://tpd.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-strategic-policy-institute-aspi",name:"Australian Strategic Policy Institute (ASPI)",category:"innovation",role:"Think Tank",description:"Defence and strategic policy think tank; International Cyber Policy Centre covers technology and innovation policy",url:"https://www.aspi.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"committee-for-economic-development-of-australia-ceda-2",name:"Committee for Economic Development of Australia (CEDA)",category:"innovation",role:"Research",description:"Innovation and productivity research; also active in cross-sector economic policy under Business",url:"https://www.ceda.com.au",contact:"info@ceda.com.au",tag2:"Also listed under Business",connections:[]},
    {id:"australian-academy-of-technology-and-engineering-atse",name:"Australian Academy of Technology and Engineering (ATSE)",category:"innovation",role:"Learned Academy",description:"Peak learned academy for technology, engineering and applied science",url:"https://www.atse.org.au",contact:"enquiries@atse.org.au",tag2:null,connections:[]},
    {id:"australian-information-industry-association-aiia",name:"Australian Information Industry Association (AIIA)",category:"innovation",role:"Peak Body",description:"Peak body for the technology industry",url:"https://aiia.com.au",contact:"admin@aiia.com.au",tag2:null,connections:[]},
    {id:"startupaus",name:"StartupAus",category:"innovation",role:"Advocacy",description:"Peak advocacy body for the startup and scaleup ecosystem",url:"https://startupaus.org",contact:"Contact via website",tag2:null,connections:[]},
    {id:"australian-computer-society-acs",name:"Australian Computer Society (ACS)",category:"innovation",role:"Peak Body",description:"Peak professional body for the ICT profession",url:"https://www.acs.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"coalition-of-aboriginal-and-torres-strait-islander-peak-organisations",name:"Coalition of Aboriginal and Torres Strait Islander Peak Organisations",category:"fn-national",role:"Coalition",description:"Umbrella of around 80 Aboriginal and Torres Strait Islander community-controlled peak organisations, formal partner to Australian governments on Closing the Gap",url:"https://www.coalitionofpeaks.org.au",contact:"Contact via website",tag2:null,connections:["national-aboriginal-community-controlled-health-organisation-naccho","snaicc-national-voice-for-our-children","national-aboriginal-and-torres-strait-islander-housing-association-natsiha-2","national-native-title-council-nntc","the-healing-foundation","northern-land-council-nlc","central-land-council-clc","first-peoples-disability-network-australia-fpdn"]},
    {id:"national-aboriginal-community-controlled-health-organisation-naccho",name:"National Aboriginal Community Controlled Health Organisation (NACCHO)",category:"fn-national",role:"Peak Body",description:"National peak body for Aboriginal community-controlled health, supports state and territory affiliates",url:"https://www.naccho.org.au",contact:"NACCHOCommunicationsandMedia@naccho.org.au",tag2:null,connections:[]},
    {id:"snaicc-national-voice-for-our-children",name:"SNAICC \u2014 National Voice for our Children",category:"fn-national",role:"Peak Body",description:"National peak body for Aboriginal and Torres Strait Islander children and families",url:"https://www.snaicc.org.au",contact:"snaicc@snaicc.org.au",tag2:null,connections:[]},
    {id:"national-aboriginal-and-torres-strait-islander-housing-association-natsiha-2",name:"National Aboriginal and Torres Strait Islander Housing Association (NATSIHA)",category:"fn-national",role:"Peak Body",description:"Peak body for Indigenous housing, co-chairs the Housing Policy Partnership with Treasury",url:"https://natsiha.org.au",contact:"Contact via website",tag2:"Also listed under Housing",connections:[]},
    {id:"national-native-title-council-nntc",name:"National Native Title Council (NNTC)",category:"fn-national",role:"Peak Body",description:"Peak body for Native Title Representative Bodies, Service Providers and Traditional Owner Corporations (PBCs) across Australia",url:"https://nntc.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"national-congress-of-australia-s-first-peoples",name:"National Congress of Australia's First Peoples",category:"fn-national",role:"Representative Body",description:"National representative body for Aboriginal and Torres Strait Islander peoples. Historic \u2014 funding withdrawn 2019, status as an active peak body has changed",url:"https://nationalcongress.com.au",contact:"Site may be inactive",tag2:null,connections:[]},
    {id:"national-aboriginal-and-torres-strait-islander-legal-services-natsils",name:"National Aboriginal and Torres Strait Islander Legal Services (NATSILS)",category:"fn-national",role:"Legal Peak Body",description:"Peak network of Aboriginal and Torres Strait Islander legal services",url:"https://www.natsils.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"first-peoples-disability-network-australia-fpdn",name:"First Peoples Disability Network Australia (FPDN)",category:"fn-national",role:"Peak Body",description:"National peak organisation for Aboriginal and Torres Strait Islander people with disability",url:"https://fpdn.org.au",contact:"admin@fpdn.org.au",tag2:null,connections:[]},
    {id:"first-nations-media-australia",name:"First Nations Media Australia",category:"fn-national",role:"Peak Body",description:"Peak body for the Indigenous media sector",url:"https://firstnationsmedia.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"first-languages-australia",name:"First Languages Australia",category:"fn-national",role:"Peak Body",description:"Peak body for Aboriginal and Torres Strait Islander languages",url:"https://www.firstlanguages.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"lowitja-institute",name:"Lowitja Institute",category:"fn-national",role:"Research Institute",description:"National institute for Aboriginal and Torres Strait Islander health research and policy",url:"https://www.lowitja.org.au",contact:"admin@lowitja.org.au",tag2:null,connections:[]},
    {id:"indigenous-allied-health-australia-iaha",name:"Indigenous Allied Health Australia (IAHA)",category:"fn-national",role:"Peak Body",description:"National peak body for the Aboriginal and Torres Strait Islander allied health workforce",url:"https://iaha.com.au",contact:"admin@iaha.com.au",tag2:null,connections:[]},
    {id:"reconciliation-australia",name:"Reconciliation Australia",category:"fn-national",role:"National Body",description:"National body leading the reconciliation agenda, including truth-telling coordination",url:"https://www.reconciliation.org.au",contact:"contact@reconciliation.org.au",tag2:null,connections:[]},
    {id:"antar-australians-for-native-title-and-reconciliation",name:"ANTAR (Australians for Native Title and Reconciliation)",category:"fn-national",role:"Advocacy",description:"National advocacy organisation for Aboriginal and Torres Strait Islander rights, tracks truth-telling processes nationally",url:"https://antar.org.au",contact:"info@antar.org.au",tag2:null,connections:[]},
    {id:"the-healing-foundation",name:"The Healing Foundation",category:"fn-national",role:"National Body",description:"National organisation focused on healing from intergenerational trauma caused by the Stolen Generations",url:"https://healingfoundation.org.au",contact:"info@healingfoundation.org.au",tag2:null,connections:[]},
    {id:"from-the-heart",name:"From the Heart",category:"fn-uluru",role:"Campaign",description:"Campaign organisation supporting implementation of the Uluru Statement from the Heart (Voice, Treaty, Truth)",url:"https://fromtheheart.com.au",contact:"info@fromtheheart.com.au",tag2:null,connections:[]},
    {id:"uluru-dialogue",name:"Uluru Dialogue",category:"fn-uluru",role:"Research / Advocacy",description:"Research and advocacy body, based at UNSW, supporting the Uluru Statement process",url:"https://ulurustatement.org",contact:"Contact via website",tag2:null,connections:[]},
    {id:"yoorrook-justice-commission",name:"Yoorrook Justice Commission",category:"fn-truth",role:"Royal Commission (concluded)",description:"Australia's first formal truth-telling inquiry (Victoria); tabled its final report July 2025 and has since concluded \u2014 retained as the reference model for state truth-telling",url:"https://www.yoorrook.org.au",contact:"Commission has concluded",tag2:null,connections:[]},
    {id:"first-peoples-assembly-of-victoria",name:"First Peoples' Assembly of Victoria",category:"fn-truth",role:"Elected Representative Body",description:"Democratically elected Aboriginal representative body for Victoria, Treaty negotiating body and Yoorrook partner",url:"https://www.firstpeoplesvic.org",contact:"info@firstpeoplesvic.org",tag2:null,connections:["yoorrook-justice-commission"]},
    {id:"queensland-truth-telling-and-healing-inquiry",name:"Queensland Truth-telling and Healing Inquiry",category:"fn-truth",role:"Inquiry (discontinued)",description:"Established under the (since-repealed) Path to Treaty Act 2023; process discontinued following the 2024 change of government",url:"https://www.qld.gov.au",contact:"Process discontinued by current QLD Government",tag2:null,connections:[]},
    {id:"south-australian-first-nations-voice-to-parliament",name:"South Australian First Nations Voice to Parliament",category:"fn-truth",role:"Elected Voice Body",description:"Elected state-based Voice body, established under the First Nations Voice Act 2023",url:"https://www.firstnationsvoicesa.sa.gov.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"northern-territory-treaty-commission",name:"Northern Territory Treaty Commission",category:"fn-truth",role:"Treaty Process (unconfirmed status)",description:"Territory-level treaty and truth-telling process; status subject to NT Government policy change \u2014 verify current status before relying on this",url:"",contact:"Not publicly listed",tag2:null,connections:[]},
    {id:"northern-land-council-nlc",name:"Northern Land Council (NLC)",category:"fn-land",role:"Statutory Land Council",description:"Statutory land council representing Traditional Owners across the Top End of the Northern Territory",url:"https://www.nlc.org.au",contact:"frontdesk@nlc.org.au",tag2:null,connections:[]},
    {id:"central-land-council-clc",name:"Central Land Council (CLC)",category:"fn-land",role:"Statutory Land Council",description:"Statutory land council representing Traditional Owners across Central Australia",url:"https://www.clc.org.au",contact:"clc@clc.org.au",tag2:null,connections:[]},
    {id:"kimberley-land-council",name:"Kimberley Land Council",category:"fn-land",role:"Peak Traditional Owner Body",description:"Peak Traditional Owner body for the Kimberley region of Western Australia",url:"https://www.klc.org.au",contact:"reception@klc.org.au",tag2:null,connections:[]},
    {id:"nsw-aboriginal-land-council-nswalc",name:"NSW Aboriginal Land Council (NSWALC)",category:"fn-land",role:"Statutory Land Council",description:"Statutory land council and largest member-based Aboriginal organisation in NSW",url:"https://alc.org.au",contact:"enquiries@alc.org.au",tag2:null,connections:[]},
    {id:"cape-york-land-council",name:"Cape York Land Council",category:"fn-land",role:"Native Title Representative Body",description:"Native title representative body for Cape York, Queensland",url:"https://cylc.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"queensland-south-native-title-services-qsnts",name:"Queensland South Native Title Services (QSNTS)",category:"fn-land",role:"Native Title Representative Body",description:"Native title representative body for southern Queensland",url:"https://qsnts.com.au",contact:"info@qsnts.com.au",tag2:null,connections:[]},
    {id:"gur-a-baradharaw-kod-gbk-sea-and-land-council",name:"Gur A Baradharaw Kod (GBK) Sea and Land Council",category:"fn-land",role:"Peak Sea and Land Council",description:"Peak representative body for Torres Strait Traditional Owners, representing 21 Registered Native Title Bodies Corporate",url:"https://nntc.com.au/members",contact:"Contact via website",tag2:null,connections:[]},
    {id:"north-australian-indigenous-land-and-sea-management-alliance-nailsma",name:"North Australian Indigenous Land and Sea Management Alliance (NAILSMA)",category:"fn-land",role:"Alliance",description:"Cross-jurisdictional alliance combining Indigenous knowledge and science for land and sea management across northern Australia",url:"https://nailsma.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"aboriginal-housing-victoria-ahv",name:"Aboriginal Housing Victoria (AHV)",category:"fn-land",role:"Housing Agency",description:"Largest Aboriginal Registered Housing Agency in Australia, Victorian Aboriginal-controlled landlord",url:"https://www.aht.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"south-australian-aboriginal-community-controlled-organisation-network-saaccon",name:"South Australian Aboriginal Community Controlled Organisation Network (SAACCON)",category:"fn-land",role:"Network (unconfirmed status)",description:"Network establishing a new Aboriginal peak housing body in South Australia",url:"",contact:"Not publicly listed",tag2:null,connections:[]},
    {id:"today",name:"Today",category:"design-studios",role:"Studio",description:"Melbourne design studio working across service, policy and systems design for government and institutional clients",url:"https://today.design",contact:"Contact via website",tag2:null,connections:[]},
    {id:"papergiant",name:"PaperGiant",category:"design-studios",role:"Studio",description:"Service design and data / AI-informed policy design consultancy",url:"https://papergiant.net",contact:"Contact via website",tag2:null,connections:[]},
    {id:"portable",name:"Portable",category:"design-studios",role:"Studio",description:"Social enterprise design studio working on public interest, health and social policy projects",url:"https://portable.com.au",contact:"hello@portable.com.au",tag2:null,connections:[]},
    {id:"snowmelt",name:"SnowMelt",category:"design-studios",role:"Studio",description:"Strategic design and futures consultancy working on policy and systems-change briefs",url:"https://www.snowmelt.io",contact:"Contact via website",tag2:null,connections:[]},
    {id:"civic-punks",name:"Civic Punks",category:"policy-labs",role:"Activist / Design Practice",description:"Activist collective and design practice working at the intersection of civic technology, participation and policy",url:"https://civicpunks.com",contact:"Contact via website",tag2:null,connections:[]},
    {id:"policy-playbook",name:"Policy Playbook",category:"policy-labs",role:"Platform / Community",description:"Platform and community for policy practitioners, sharing tools and case studies for policy design practice",url:"https://www.thepolicyplaybook.org",contact:"Contact via website",tag2:null,connections:[]},
    {id:"dragonfly-thinking",name:"Dragonfly Thinking",category:"policy-labs",role:"Consultancy",description:"Systems and futures-oriented policy and strategy consultancy",url:"https://dragonflythinking.com",contact:"Contact via website",tag2:null,connections:[]},
    {id:"fore",name:"FORE",category:"policy-labs",role:"Systems Change Organisation",description:"Purpose-driven organisation working on regenerative economic and social systems change",url:"https://www.foregood.org.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"states-of-change",name:"States of Change",category:"policy-labs",role:"Network / Practice",description:"International network and practice supporting public-sector innovation, policy design capability-building and civic labs",url:"https://states-of-change.org",contact:"Contact via website",tag2:null,connections:["ylab"]},
    {id:"ylab",name:"YLab",category:"policy-labs",role:"Youth Co-design Lab",description:"Youth-led policy co-design lab, operating in partnership with States of Change",url:"https://states-of-change.org",contact:"Contact via website",tag2:null,connections:[]},
    {id:"reapra",name:"REAPRA",category:"policy-labs",role:"Venture / Ecosystem Practice",description:"Entrepreneurship-through-inquiry venture and ecosystem-building practice, active in policy-adjacent innovation systems work",url:"https://reapra.com",contact:"Contact via website",tag2:null,connections:[]},
    {id:"service-design-in-government-sdingov",name:"Service Design in Government (SDinGov)",category:"events",role:"Conference",description:"International public-service design conference; 2026 edition 23\u201325 September, Edinburgh; regularly draws Australian public-sector delegates",url:"https://govservicedesign.net",contact:"Contact via website",tag2:null,connections:[]},
    {id:"openfisca-policy-innovation-and-rules-as-code-conference",name:"OpenFisca / Policy Innovation and Rules as Code Conference",category:"events",role:"Conference",description:"Canberra, 30\u201331 March 2026; computational policy design and \u201crules as code,\u201d with a Dept of Finance gov-to-gov session",url:"https://openfisca.org/en/conference/2026",contact:"Contact via website",tag2:null,connections:[]},
    {id:"government-innovation-week-government-innovation-showcase",name:"Government Innovation Week / Government Innovation Showcase",category:"events",role:"Conference Series",description:"Federal and state-based editions (Canberra, Adelaide and others) through 2026, run by Public Sector Network; covers AI, service design, citizen experience",url:"https://publicsectornetwork.com",contact:"Contact via website",tag2:null,connections:[]},
    {id:"ceda-state-of-the-nation-and-sector-forums",name:"CEDA State of the Nation and sector forums",category:"events",role:"Forum Series",description:"CEDA's flagship economic policy events",url:"https://www.ceda.com.au",contact:"info@ceda.com.au",tag2:null,connections:[]},
    {id:"australian-public-service-academy-service-design-courses",name:"Australian Public Service Academy \u2014 service design courses",category:"events",role:"Capability Program",description:"Recurring capability-building program rather than a single conference; standing fixture for policy design practitioners in government",url:"https://www.apsacademy.gov.au/service-design",contact:"Contact via website",tag2:null,connections:[]},
    {id:"melbourne-design-week",name:"Melbourne Design Week",category:"events",role:"Design Week",description:"Broader design event with a growing policy design and public-sector design presence",url:"https://www.melbournedesignweek.com.au",contact:"Contact via website",tag2:null,connections:[]},
    {id:"aare-conference",name:"AARE Conference",category:"events",role:"Conference",description:"Australian Association for Research in Education's annual conference \u2014 key education research and policy gathering",url:"https://www.aare.edu.au",contact:"office@aare.edu.au",tag2:null,connections:[]}
  ];

  // 2. GRAPH BUILD — turns each node's connections[] into real two-way edges, no dupes
  var nodeById = {};
  NODES.forEach(function(n){ nodeById[n.id] = n; n.degree = 0; n.linked = new Set(); });

  var EDGES = [];
  (function buildEdges(){
    var seen = new Set();
    NODES.forEach(function(n){
      (n.connections || []).forEach(function(targetId){
        if (!nodeById[targetId] || targetId === n.id) return;
        var key = [n.id, targetId].sort().join('|');
        if (seen.has(key)) return;
        seen.add(key);
        EDGES.push({ a:n.id, b:targetId, cross:n.category !== nodeById[targetId].category });
        n.degree++; nodeById[targetId].degree++;
        n.linked.add(targetId); nodeById[targetId].linked.add(n.id);
      });
    });
  })();

  var catIndex = {};
  CATEGORIES.forEach(function(c, i){ catIndex[c.id] = i; });

  // 3. THEME HELPERS — little utils for pulling colours out of the CSS vars
  function cssVar(name){
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }
  function hexToVec(hex){
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
    var r = parseInt(hex.substr(0,2),16)/255;
    var g = parseInt(hex.substr(2,2),16)/255;
    var b = parseInt(hex.substr(4,2),16)/255;
    return {r:r,g:g,b:b};
  }
  function catColorHex(catId){
    var cat = CATEGORIES.filter(function(c){return c.id===catId;})[0];
    return cssVar(cat.color);
  }

  // 4. LAYOUT — works out where every node sits ONCE up front, no physics running every frame
  var layout = {}; // id -> THREE.Vector3 (local, pre-rotation)

  function computeLayout(){
    var THREE_ = window.THREE;
    var ringRadius = 150;
    var catCounts = {};
    NODES.forEach(function(n){ catCounts[n.category] = (catCounts[n.category] || 0) + 1; });

    var anchors = CATEGORIES.map(function(c, i){
      var a = (i / CATEGORIES.length) * Math.PI * 2;
      return new THREE_.Vector3(Math.cos(a) * ringRadius, (i % 2 === 0 ? 9 : -9), Math.sin(a) * ringRadius);
    });

    // group nodes into (category, subcategory) clusters so each subcategory
    // reads as its own small constellation within the category's ring segment
    var subKeyOf = function(n){ return n.category + '||' + n.role; };
    var subGroups = {};
    NODES.forEach(function(n){
      var key = subKeyOf(n);
      (subGroups[key] = subGroups[key] || []).push(n);
    });
    var siblingsByCategory = {};
    Object.keys(subGroups).forEach(function(key){
      var catId = key.split('||')[0];
      (siblingsByCategory[catId] = siblingsByCategory[catId] || []).push(key);
    });

    var subAnchor = {}; // "cat||subcat" -> local Vector3 offset from category anchor
    Object.keys(subGroups).forEach(function(key){
      var catId = key.split('||')[0];
      var siblingKeys = siblingsByCategory[catId];
      var subIdx = siblingKeys.indexOf(key);
      var subCount = siblingKeys.length;
      var localRadius = 10 + Math.sqrt(catCounts[catId]) * 3.4;
      var a = subCount > 1 ? (subIdx / subCount) * Math.PI * 2 : 0;
      subAnchor[key] = new THREE_.Vector3(Math.cos(a) * localRadius, (subIdx % 2 === 0 ? 3.5 : -3.5), Math.sin(a) * localRadius);
    });

    var combinedAnchor = {};
    NODES.forEach(function(n){
      var catAnchor = anchors[catIndex[n.category]];
      var sAnchor = subAnchor[subKeyOf(n)];
      combinedAnchor[n.id] = catAnchor.clone().add(sAnchor);
    });

    NODES.forEach(function(n){
      var anchor = combinedAnchor[n.id];
      var jitter = 6.5;
      layout[n.id] = new THREE_.Vector3(
        anchor.x + (Math.random() - 0.5) * jitter,
        anchor.y + (Math.random() - 0.5) * jitter,
        anchor.z + (Math.random() - 0.5) * jitter
      );
    });

    // relax: attraction to combined (category+subcategory) anchor + mild mutual repulsion,
    // run synchronously up-front (not per animation frame)
    var ids = NODES.map(function(n){return n.id;});
    for (var iter = 0; iter < 70; iter++){
      for (var i = 0; i < ids.length; i++){
        var pi = layout[ids[i]];
        var anchor = combinedAnchor[ids[i]];
        pi.lerp(anchor, 0.02);
        for (var j = i + 1; j < ids.length; j++){
          var pj = layout[ids[j]];
          var d = pi.distanceTo(pj);
          var minDist = 5.5;
          if (d < minDist && d > 0.0001){
            var push = (minDist - d) * 0.5;
            var dir = new THREE_.Vector3().subVectors(pi, pj).normalize().multiplyScalar(push * 0.05);
            pi.add(dir); pj.sub(dir);
          }
        }
      }
    }
  }

  // 5. THREE.JS SCENE — the actual webgl setup, camera, points, lines, all that
  var wrap = document.getElementById('canvas-wrap');
  var THREE_ = window.THREE;
  var scene, camera, renderer, constellation, pointCloud, lineBase, lineHighlight;
  var backgroundStars, milkyWayBand;
  var raf = null;
  var needsRender = true;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ambientEnabled = !reduceMotion;

  var state = {
    hoveredId: null,
    selectedId: null,
    activeCats: {}, // id -> bool
    query: '',
    dragging: false,
    focusMode: false
  };
  CATEGORIES.forEach(function(c){ state.activeCats[c.id] = true; });

  // ---- space-themed sound fx — all synthesised with Web Audio, no mp3s to ship ----
  var MUTE_KEY = 'signals-muted';
  state.muted = localStorage.getItem(MUTE_KEY) === '1';

  var audioCtx = null, masterGain = null;

  function ensureAudio(){
    if (audioCtx) return;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return; // ancient browser or no audio support, just skip sound entirely
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.muted ? 0 : 1;
    masterGain.connect(audioCtx.destination);
  }

  // no ambient hum anymore, just the click sfx — each one's a tiny "chime" made of the note
  // plus a quiet, slightly-detuned overtone on top so it comes out glassy/sparkly instead of a flat beep
  function playChime(freq, duration, peak, delay){
    if (!audioCtx || state.muted) return;
    var t0 = audioCtx.currentTime + (delay || 0);
    [1, 2.01].forEach(function(overtoneMult, idx){
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * overtoneMult;
      var localPeak = idx === 0 ? peak : peak * 0.35; // overtone sits quietly under the main note
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(localPeak, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    });
  }

  // no background sound anymore — just the click + hover chimes below, nothing playing on a loop

  function playHoverSound(){ playChime(1760, 0.12, 0.05); } // one quick twinkly tick (A6)
  function playSelectSound(){ // little ascending sparkle — C E G C, like a magic "ding!"
    [1046.5, 1318.5, 1568, 2093].forEach(function(freq, i){ playChime(freq, 0.22, 0.07, i * 0.045); });
  }
  function playCloseSound(){ // same sparkle played back down and softer, stepping back out of focus
    [1568, 1318.5, 1046.5, 784].forEach(function(freq, i){ playChime(freq, 0.2, 0.05, i * 0.04); });
  }

  // browsers won't let any sound play until there's been a real click/tap/keypress —
  // this just wakes the audio context up on whichever comes first
  function wakeAudio(){
    ensureAudio();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    window.removeEventListener('pointerdown', wakeAudio);
    window.removeEventListener('keydown', wakeAudio);
  }
  window.addEventListener('pointerdown', wakeAudio, { once:true });
  window.addEventListener('keydown', wakeAudio, { once:true });

  var OVERVIEW_CAMERA_Z = 420;
  var FOCUS_CAMERA_Z = 230;
  var targetGroupPos = new THREE_.Vector3(0, 0, 0);
  var targetCameraZ = OVERVIEW_CAMERA_Z;

  function enterFocus(id){
    state.focusMode = true;
    document.body.classList.add('focus-active');
    var local = layout[id];
    var rotated = local.clone().applyEuler(constellation.rotation);
    targetGroupPos.copy(rotated).negate();
    targetCameraZ = FOCUS_CAMERA_Z;
    var node = nodeById[id];
    var cat = CATEGORIES.filter(function(c){ return c.id === node.category; })[0];
    $('focus-back-label').textContent = node.name;
    $('focus-back-dot').style.background = cssVar(cat.color);
  }

  function exitFocus(){
    state.focusMode = false;
    document.body.classList.remove('focus-active');
    targetGroupPos.set(0, 0, 0);
    targetCameraZ = OVERVIEW_CAMERA_Z;
  }

  // keeps the selected node pinned at the centre while you drag-rotate around it in focus mode —
  // recomputes where that node would land given the CURRENT rotation, re-centers on that
  function updateFocusPivot(){
    if (!state.focusMode || !state.selectedId) return;
    var rotated = layout[state.selectedId].clone().applyEuler(constellation.rotation);
    targetGroupPos.copy(rotated).negate();
  }

  var VERT_SHADER = [
    'attribute float aSize;',
    'attribute vec3 aColor;',
    'attribute float aHighlight;',
    'attribute float aVisible;',
    'varying vec3 vColor;',
    'varying float vHighlight;',
    'varying float vVisible;',
    'void main(){',
    '  vColor = aColor;',
    '  vHighlight = aHighlight;',
    '  vVisible = aVisible;',
    '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
    '  float dynamicSize = aSize * (1.0 + aHighlight * 0.85);',
    '  gl_PointSize = dynamicSize * (440.0 / -mvPosition.z);',
    '  gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n');

  var FRAG_SHADER = [
    'precision mediump float;',
    'varying vec3 vColor;',
    'varying float vHighlight;',
    'varying float vVisible;',
    'uniform float uDim;',
    'void main(){',
    '  if (vVisible < 0.5) discard;',
    '  vec2 c = gl_PointCoord - vec2(0.5);',
    '  float d = length(c);',
    '  float alpha = smoothstep(0.5, 0.4, d);',
    '  if (alpha < 0.02) discard;',
    '  vec3 col = mix(vColor, vec3(1.0), vHighlight * 0.55);',
    '  float dimAmount = uDim * (1.0 - vHighlight) * 0.72;',
    '  float brightness = 1.0 - dimAmount;',
    '  gl_FragColor = vec4(col * brightness, alpha * mix(1.0, 0.9, dimAmount));',
    '}'
  ].join('\n');

  function initScene(){
    scene = new THREE_.Scene();
    var w = wrap.clientWidth, h = wrap.clientHeight;
    camera = new THREE_.PerspectiveCamera(48, w / h, 0.1, 2000);
    camera.position.set(0, 12, 420);

    renderer = new THREE_.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h);
    wrap.appendChild(renderer.domElement);

    constellation = new THREE_.Group();
    scene.add(constellation);

    buildBackgroundStars(); // deep-space backdrop, sits behind everything, not inside the constellation group
    buildPoints();
    buildLines();

    window.addEventListener('resize', onResize);
    attachPointerHandlers(renderer.domElement);
  }

  // ---- deep-space backdrop: scattered far stars + a tilted, denser "milky way" band ----
  // lives straight on the scene (not inside the constellation group) so it reads as a fixed
  // backdrop behind everything no matter how you spin or zoom the actual network
  function buildBackgroundStars(){
    // sizeAttenuation was making these shrink to sub-pixel at this distance from the camera —
    // that's why they weren't showing up before. Fixed pixel size (sizeAttenuation:false) instead,
    // so they stay clearly visible no matter how far away or how much you zoom.
    var farCount = 1100;
    var farGeo = new THREE_.BufferGeometry();
    var farPositions = new Float32Array(farCount * 3);
    var farColors = new Float32Array(farCount * 3);
    for (var i = 0; i < farCount; i++){
      // scatter on a big sphere shell well outside the network so it's always "out there"
      var r = 900 + Math.random() * 600;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos((Math.random() * 2) - 1);
      farPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      farPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      farPositions[i*3+2] = r * Math.cos(phi);
      var warmth = Math.random();
      farColors[i*3]   = 0.8 + warmth * 0.2;
      farColors[i*3+1] = 0.85 + warmth * 0.1;
      farColors[i*3+2] = 0.9 + (1 - warmth) * 0.1;
    }
    farGeo.setAttribute('position', new THREE_.BufferAttribute(farPositions, 3));
    farGeo.setAttribute('color', new THREE_.BufferAttribute(farColors, 3));
    var farMat = new THREE_.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: false });
    backgroundStars = new THREE_.Points(farGeo, farMat);
    scene.add(backgroundStars);

    // denser band of points clustered near a tilted plane — reads as a milky-way-ish smear
    var bandCount = 1800;
    var bandGeo = new THREE_.BufferGeometry();
    var bandPositions = new Float32Array(bandCount * 3);
    var bandColors = new Float32Array(bandCount * 3);
    var tilt = 0.6;
    for (var j = 0; j < bandCount; j++){
      var a = Math.random() * Math.PI * 2;
      var rad = 950 + (Math.random() - 0.5) * 260;
      var spread = (Math.random() - 0.5) * 140; // how thick the band looks
      var bx = Math.cos(a) * rad;
      var bz = Math.sin(a) * rad;
      var by = spread + Math.sin(a * 2.0) * 40;
      bandPositions[j*3]   = bx;
      bandPositions[j*3+1] = by * Math.cos(tilt) - bz * Math.sin(tilt);
      bandPositions[j*3+2] = by * Math.sin(tilt) + bz * Math.cos(tilt);
      var tint = Math.random();
      bandColors[j*3]   = 0.75 + tint * 0.25;
      bandColors[j*3+1] = 0.78 + tint * 0.2;
      bandColors[j*3+2] = 0.85 + (1 - tint) * 0.15;
    }
    bandGeo.setAttribute('position', new THREE_.BufferAttribute(bandPositions, 3));
    bandGeo.setAttribute('color', new THREE_.BufferAttribute(bandColors, 3));
    var bandMat = new THREE_.PointsMaterial({ size: 1.3, vertexColors: true, transparent: true, opacity: 0.22, depthWrite: false, sizeAttenuation: false });
    milkyWayBand = new THREE_.Points(bandGeo, bandMat);
    scene.add(milkyWayBand);

    // a few bigger, brighter accent stars scattered closer in, for a bit of sparkle/depth
    var accentCount = 60;
    var accentGeo = new THREE_.BufferGeometry();
    var accentPositions = new Float32Array(accentCount * 3);
    for (var k = 0; k < accentCount; k++){
      var ra = 550 + Math.random() * 500;
      var ta = Math.random() * Math.PI * 2;
      var pa = Math.acos((Math.random() * 2) - 1);
      accentPositions[k*3]   = ra * Math.sin(pa) * Math.cos(ta);
      accentPositions[k*3+1] = ra * Math.sin(pa) * Math.sin(ta);
      accentPositions[k*3+2] = ra * Math.cos(pa);
    }
    accentGeo.setAttribute('position', new THREE_.BufferAttribute(accentPositions, 3));
    var accentMat = new THREE_.PointsMaterial({ size: 3, color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false, sizeAttenuation: false });
    var accentStars = new THREE_.Points(accentGeo, accentMat);
    scene.add(accentStars);
  }

  function buildPoints(){
    var n = NODES.length;
    var positions = new Float32Array(n * 3);
    var colors = new Float32Array(n * 3);
    var sizes = new Float32Array(n);
    var highlight = new Float32Array(n);
    var visible = new Float32Array(n);

    NODES.forEach(function(node, i){
      var p = layout[node.id];
      positions[i*3] = p.x; positions[i*3+1] = p.y; positions[i*3+2] = p.z;
      var c = hexToVec(catColorHex(node.category));
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
      sizes[i] = 6 + Math.min(node.degree, 6) * 1.6;
      highlight[i] = 0;
      visible[i] = 1;
      node._idx = i;
    });

    var geo = new THREE_.BufferGeometry();
    geo.setAttribute('position', new THREE_.BufferAttribute(positions, 3));
    geo.setAttribute('aColor', new THREE_.BufferAttribute(colors, 3));
    geo.setAttribute('aSize', new THREE_.BufferAttribute(sizes, 1));
    geo.setAttribute('aHighlight', new THREE_.BufferAttribute(highlight, 1));
    geo.setAttribute('aVisible', new THREE_.BufferAttribute(visible, 1));

    var mat = new THREE_.ShaderMaterial({
      uniforms: { uDim: { value: 0 } },
      vertexShader: VERT_SHADER,
      fragmentShader: FRAG_SHADER,
      transparent: true,
      depthWrite: false
    });

    pointCloud = new THREE_.Points(geo, mat);
    constellation.add(pointCloud);
  }

  function buildLines(){
    var basePositions = [];
    var baseColors = [];
    EDGES.forEach(function(e){
      var pa = layout[e.a], pb = layout[e.b];
      basePositions.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
      var c = hexToVec(catColorHex(nodeById[e.a].category));
      baseColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
    });
    var geo = new THREE_.BufferGeometry();
    geo.setAttribute('position', new THREE_.Float32BufferAttribute(basePositions, 3));
    geo.setAttribute('color', new THREE_.Float32BufferAttribute(baseColors, 3));
    var mat = new THREE_.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.28, depthWrite:false });
    lineBase = new THREE_.LineSegments(geo, mat);
    constellation.add(lineBase);

    var hMat = new THREE_.LineBasicMaterial({ color: new THREE_.Color(cssVar('--accent')), transparent:true, opacity:0.95, depthWrite:false });
    var hGeo = new THREE_.BufferGeometry();
    hGeo.setAttribute('position', new THREE_.BufferAttribute(new Float32Array(0), 3));
    lineHighlight = new THREE_.LineSegments(hGeo, hMat);
    constellation.add(lineHighlight);
  }

  function updateHighlightLines(){
    var THREE__ = window.THREE;
    var focusId = state.selectedId || state.hoveredId;
    if (!focusId){
      lineHighlight.geometry.setAttribute('position', new THREE__.BufferAttribute(new Float32Array(0), 3));
      return;
    }
    var arr = [];
    var focusPos = layout[focusId];
    nodeById[focusId].linked.forEach(function(otherId){
      var p = layout[otherId];
      arr.push(focusPos.x, focusPos.y, focusPos.z, p.x, p.y, p.z);
    });
    lineHighlight.geometry.setAttribute('position', new THREE__.Float32BufferAttribute(arr, 3));
  }

  // ---- name pill for whichever connected node you're currently hovering ----
  // only shows on hover now, not all of them at once — reuses one pooled div per node so we're
  // not creating/destroying elements every frame
  var connLabelsWrap = document.getElementById('conn-labels');
  var connLabelPool = [];

  function getConnLabelEl(i){
    var el = connLabelPool[i];
    if (!el){
      el = document.createElement('div');
      el.className = 'conn-label';
      connLabelsWrap.appendChild(el);
      connLabelPool[i] = el;
    }
    return el;
  }

  function updateConnLabels(){
    if (!state.focusMode || !state.selectedId){
      connLabelPool.forEach(function(el){ el.classList.remove('visible'); });
      return;
    }
    var ids = [state.selectedId].concat(Array.from(nodeById[state.selectedId].linked));
    ids.forEach(function(id, i){
      var el = getConnLabelEl(i);
      if (id !== state.hoveredId){ el.classList.remove('visible'); return; } // only the hovered one shows
      var node = nodeById[id];
      var s = projectNode(node);
      if (el.textContent !== node.name) el.textContent = node.name; // ellipsis via CSS, title attr gives the full name
      el.title = node.name;
      el.classList.toggle('self', id === state.selectedId);
      if (s.z > 1){ el.classList.remove('visible'); return; }
      el.style.left = s.x + 'px';
      el.style.top = s.y + 'px';
      el.classList.add('visible');
    });
    for (var j = ids.length; j < connLabelPool.length; j++){
      connLabelPool[j].classList.remove('visible');
    }
  }

  function refreshPointAttributes(){
    var geo = pointCloud.geometry;
    var hi = geo.attributes.aHighlight.array;
    var vis = geo.attributes.aVisible.array;
    var focusId = state.selectedId || state.hoveredId;
    var searching = state.query.trim().length > 0;

    NODES.forEach(function(node){
      var i = node._idx;
      if (state.focusMode && state.selectedId){
        var isSelf = node.id === state.selectedId;
        var isNeighbor = nodeById[state.selectedId].linked.has(node.id);
        vis[i] = (isSelf || isNeighbor) ? 1 : 0;
        hi[i] = isSelf ? 1 : (isNeighbor ? 0.55 : 0);
      } else {
        var catOn = state.activeCats[node.category];
        var matchesSearch = !searching || matchesQuery(node, state.query);
        vis[i] = (catOn && matchesSearch) ? 1 : 0;

        var isFocus = focusId && (node.id === focusId || nodeById[focusId].linked.has(node.id));
        hi[i] = focusId ? (isFocus ? (node.id === focusId ? 1 : 0.55) : 0) : 0;
      }
    });

    geo.attributes.aHighlight.needsUpdate = true;
    geo.attributes.aVisible.needsUpdate = true;
    pointCloud.material.uniforms.uDim.value = (focusId || state.focusMode) ? 1 : 0;
    lineBase.visible = !state.focusMode;
    updateHighlightLines();
    updateConnLabels();
    needsRender = true;
  }

  function matchesQuery(node, q){
    q = q.toLowerCase();
    return node.name.toLowerCase().indexOf(q) !== -1 ||
           node.role.toLowerCase().indexOf(q) !== -1 ||
           node.description.toLowerCase().indexOf(q) !== -1;
  }

  /* ---------------- pointer interaction ---------------- */

  var pointer = { x:0, y:0, downX:0, downY:0, moved:false, active:false };
  var _tmpVec = new THREE_.Vector3();
  var lastPickAt = 0;

  function projectNode(node){
    _tmpVec.copy(layout[node.id]).applyMatrix4(constellation.matrixWorld);
    _tmpVec.project(camera);
    var w = wrap.clientWidth, h = wrap.clientHeight;
    return {
      x: (_tmpVec.x * 0.5 + 0.5) * w,
      y: (-_tmpVec.y * 0.5 + 0.5) * h,
      z: _tmpVec.z
    };
  }

  function isNodePickable(node){
    if (state.focusMode && state.selectedId){
      return node.id === state.selectedId || nodeById[state.selectedId].linked.has(node.id);
    }
    if (!state.activeCats[node.category]) return false;
    if (state.query.trim() && !matchesQuery(node, state.query)) return false;
    return true;
  }

  function pickNodeAt(px, py){
    constellation.updateMatrixWorld(true);
    var best = null, bestDist = 26; // px threshold
    NODES.forEach(function(node){
      if (!isNodePickable(node)) return;
      var s = projectNode(node);
      if (s.z > 1) return;
      var dx = s.x - px, dy = s.y - py;
      var d = Math.sqrt(dx*dx + dy*dy);
      if (d < bestDist){ bestDist = d; best = node; }
    });
    return best;
  }

  function attachPointerHandlers(el){
    // grabbing the tooltip once so we're not doing getElementById every mousemove, ya feel
    var tooltipEl = document.getElementById('node-tooltip');
    function hideTooltip(){ tooltipEl.classList.remove('visible'); }
    function showTooltip(name, x, y){
      tooltipEl.textContent = name;
      tooltipEl.style.left = x + 'px';
      tooltipEl.style.top = y + 'px';
      tooltipEl.classList.add('visible');
    }

    el.addEventListener('pointerdown', function(e){
      pointer.active = true; pointer.moved = false;
      pointer.downX = pointer.x = e.clientX;
      pointer.downY = pointer.y = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      hideTooltip(); // don't want the label just floating there while you drag
    });

    el.addEventListener('pointermove', function(e){
      var now = performance.now();
      if (pointer.active){
        var dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
        if (Math.abs(e.clientX - pointer.downX) > 4 || Math.abs(e.clientY - pointer.downY) > 4) pointer.moved = true;
        if (pointer.moved){
          // rotating works in focus mode too now — orbit around whatever node's selected
          constellation.rotation.y += dx * 0.006;
          constellation.rotation.x = Math.max(-0.6, Math.min(0.6, constellation.rotation.x + dy * 0.006));
          if (state.focusMode) updateFocusPivot(); // re-center on the selected node as it spins
          needsRender = true;
        }
        pointer.x = e.clientX; pointer.y = e.clientY;
      } else {
        if (now - lastPickAt < 40) return; // throttle ~25fps
        lastPickAt = now;
        var rect = el.getBoundingClientRect();
        var hit = pickNodeAt(e.clientX - rect.left, e.clientY - rect.top);
        var newId = hit ? hit.id : null;
        if (newId !== state.hoveredId){
          state.hoveredId = newId;
          if (!state.focusMode) refreshPointAttributes();
          else updateConnLabels(); // in focus mode the pill only shows for whatever's hovered right now
          el.style.cursor = newId ? 'pointer' : 'grab';
          if (newId) playHoverSound(); // little blip every time you land on a new node
        }
        // plain cursor tooltip is for the normal overview — in focus mode we've got the pill labels instead
        if (hit && !state.focusMode){
          showTooltip(hit.name, e.clientX, e.clientY);
        } else {
          hideTooltip();
        }
      }
    });

    // gotta hide the tooltip when cursor leaves canvas or it just gets stuck there forever
    el.addEventListener('pointerleave', function(){
      state.hoveredId = null;
      hideTooltip();
      if (!state.focusMode) refreshPointAttributes();
      else updateConnLabels();
    });

    function endDrag(e){
      pointer.active = false;
      el.classList.remove('dragging');
      if (!pointer.moved){
        var rect = el.getBoundingClientRect();
        var hit = pickNodeAt(e.clientX - rect.left, e.clientY - rect.top);
        selectNode(hit ? hit.id : null);
      }
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    el.addEventListener('wheel', function(e){
      e.preventDefault();
      // zoom works in focus mode too now, so you can get in close on a node's connections
      camera.position.z = Math.max(160, Math.min(850, camera.position.z + e.deltaY * 0.2));
      needsRender = true;
    }, { passive:false });

    // basic pinch-to-zoom
    var pinchStartDist = null, pinchStartZ = null;
    el.addEventListener('touchstart', function(e){
      if (e.touches.length === 2){
        pinchStartDist = touchDist(e.touches);
        pinchStartZ = camera.position.z;
      }
    }, { passive:true });
    el.addEventListener('touchmove', function(e){
      if (e.touches.length === 2 && pinchStartDist){
        var d = touchDist(e.touches);
        var scale = pinchStartDist / d;
        camera.position.z = Math.max(160, Math.min(850, pinchStartZ * scale));
        needsRender = true;
      }
    }, { passive:true });
    function touchDist(t){
      var dx = t[0].clientX - t[1].clientX, dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx*dx + dy*dy);
    }
  }

  function onResize(){
    var w = wrap.clientWidth, h = wrap.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    needsRender = true;
  }

  /* ---------------- render loop (dirty-flag gated) ---------------- */
  function tick(){
    raf = requestAnimationFrame(tick);
    if (ambientEnabled && !state.focusMode && !state.hoveredId){
      constellation.rotation.y += 0.0003; // calvin slowed this way down + made it pause on hover, way easier to read names now
      needsRender = true;
    }

    // backdrop drifts on its own, totally independent of the network — it's meant to feel like
    // we're just sitting still in space while everything else moves, not spin with the drag
    if (!reduceMotion){
      backgroundStars.rotation.y += 0.00004;
      milkyWayBand.rotation.y += 0.000025;
      needsRender = true;
    }

    var posDiff = constellation.position.distanceTo(targetGroupPos);
    var zDiff = Math.abs(camera.position.z - targetCameraZ);
    var animating = posDiff > 0.05 || zDiff > 0.3;
    if (animating){
      constellation.position.lerp(targetGroupPos, 0.14);
      camera.position.z += (targetCameraZ - camera.position.z) * 0.14;
      needsRender = true;
    }

    // pills need to re-track their dot every frame the camera's still easing into focus
    if (state.focusMode && animating) updateConnLabels();

    if (needsRender){
      renderer.render(scene, camera);
      needsRender = (ambientEnabled && !state.focusMode) || animating;
    }
  }

  // 6. UI WIRING — all the button clicks n stuff live down here
  var $ = function(id){ return document.getElementById(id); };

  function buildLegend(){
    // leaving this building straight into <nav> — calvin's handling the collapsible sectors panel on his end
    var legend = $('legend');

    // title row now has select-all + close-all sitting next to it
    var headerEl = document.createElement('div');
    headerEl.className = 'legend-header';
    var titleEl = document.createElement('div');
    titleEl.className = 'legend-title';
    titleEl.textContent = 'Sectors';

    var actionsEl = document.createElement('div');
    actionsEl.className = 'legend-actions';
    var selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'legend-action-btn';
    selectAllBtn.type = 'button';
    selectAllBtn.textContent = 'Select all';
    var closeAllBtn = document.createElement('button');
    closeAllBtn.className = 'legend-action-btn';
    closeAllBtn.type = 'button';
    closeAllBtn.textContent = 'Close all';
    actionsEl.appendChild(selectAllBtn);
    actionsEl.appendChild(closeAllBtn);

    headerEl.appendChild(titleEl);
    headerEl.appendChild(actionsEl);
    legend.appendChild(headerEl);

    var chipsWrap = document.createElement('div');
    chipsWrap.className = 'legend-chips';
    legend.appendChild(chipsWrap);

    var chipEls = []; // keep track so select/close all can flip every chip's look at once

    CATEGORIES.forEach(function(cat){
      var count = NODES.filter(function(n){return n.category === cat.id;}).length;
      var chip = document.createElement('button');
      chip.className = 'chip';
      chip.type = 'button';
      chip.setAttribute('aria-pressed', 'true');
      chip.innerHTML =
        '<span class="chip-dot" style="background:' + cssVar(cat.color) + '"></span>' +
        '<span>' + cat.label + '</span>' +
        '<span class="chip-count mono">' + count + '</span>';
      chip.addEventListener('click', function(){
        state.activeCats[cat.id] = !state.activeCats[cat.id];
        chip.setAttribute('aria-pressed', String(state.activeCats[cat.id]));
        refreshPointAttributes();
      });
      chipsWrap.appendChild(chip);
      chipEls.push({ chip: chip, catId: cat.id });
    });

    // one helper for both buttons so we're not copy-pasting the same loop twice
    function setAllCats(isOn){
      chipEls.forEach(function(entry){
        state.activeCats[entry.catId] = isOn;
        entry.chip.setAttribute('aria-pressed', String(isOn));
      });
      refreshPointAttributes();
    }

    closeAllBtn.addEventListener('click', function(){ setAllCats(false); }); // blank the map, pick your own sectors
    selectAllBtn.addEventListener('click', function(){ setAllCats(true); }); // undo button for close all basically
  }

  function selectNode(id){
    state.selectedId = id;
    state.hoveredId = null;
    if (id){
      enterFocus(id);
      showProfile(id);
      playSelectSound(); // little two-note "confirm" chime
    } else {
      exitFocus();
      hideProfile();
      playCloseSound(); // softer tone backing out to the full map
    }
    refreshPointAttributes();
  }

  function showProfile(id){
    var node = nodeById[id];
    var cat = CATEGORIES.filter(function(c){return c.id===node.category;})[0];

    $('profile-dot').style.background = cssVar(cat.color);
    $('profile-name').textContent = node.name;
    $('profile-role').textContent = node.role || '';
    $('profile-desc').textContent = node.description || '';
    $('profile-contact').textContent = node.contact ? ('Contact: ' + node.contact) : '';

    var tagsHtml = '<span class="tag">' + cat.label + '</span>';
    if (node.tag2) tagsHtml += '<span class="tag">' + node.tag2 + '</span>';
    $('profile-tags').innerHTML = tagsHtml;

    var linkEl = $('profile-link');
    if (node.url){
      linkEl.href = node.url;
      linkEl.style.display = 'inline-block';
    } else {
      linkEl.style.display = 'none';
    }

    var connIds = Array.from(node.linked);
    $('conn-count').textContent = connIds.length;
    var list = $('conn-list');
    list.innerHTML = '';
    $('conn-empty').style.display = connIds.length ? 'none' : 'block';
    connIds.forEach(function(cid){
      var other = nodeById[cid];
      var btn = document.createElement('button');
      btn.className = 'conn-btn';
      var otherCat = CATEGORIES.filter(function(c){return c.id===other.category;})[0];
      btn.innerHTML = '<span class="conn-dot" style="background:' + cssVar(otherCat.color) + '"></span><span>' + other.name + '</span>';
      btn.addEventListener('click', function(){ selectNode(cid); });
      list.appendChild(btn);
    });

    $('profile').classList.add('open');
    $('profile').setAttribute('aria-hidden', 'false');
    $('settings-panel').classList.remove('open');
  }

  function hideProfile(){
    $('profile').classList.remove('open');
    $('profile').setAttribute('aria-hidden', 'true');
  }

  $('profile-close').addEventListener('click', function(){ selectNode(null); });
  $('focus-back-btn').addEventListener('click', function(){ selectNode(null); });

  window.addEventListener('keydown', function(e){
    if (e.key === 'Escape') selectNode(null);
  });

  /* search */
  var searchWrap = $('search-wrap');
  var searchInput = $('search-input');
  $('search-wrap').querySelector('svg').parentNode.addEventListener('click', function(){
    searchWrap.classList.add('open');
    searchInput.focus();
  });
  searchInput.addEventListener('focus', function(){ searchWrap.classList.add('open'); });
  searchInput.addEventListener('blur', function(){ if (!searchInput.value) searchWrap.classList.remove('open'); });
  var searchDebounce;
  searchInput.addEventListener('input', function(){
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function(){
      state.query = searchInput.value;
      refreshPointAttributes();
      updateNodeCountLabel();
    }, 160);
  });

  function updateNodeCountLabel(){
    var visibleCount = NODES.filter(function(n){
      return state.activeCats[n.category] && (!state.query.trim() || matchesQuery(n, state.query));
    }).length;
    $('node-count-label').textContent = visibleCount + ' / ' + NODES.length + ' practitioners';
  }

  /* mute button — flips the master gain and remembers your choice for next time */
  var muteBtn = $('mute-btn');
  var muteIconOn = $('mute-icon-on');
  var muteIconOff = $('mute-icon-off');
  function paintMuteBtn(){
    muteBtn.setAttribute('aria-pressed', String(state.muted));
    muteIconOn.style.display = state.muted ? 'none' : '';
    muteIconOff.style.display = state.muted ? '' : 'none';
  }
  paintMuteBtn();
  muteBtn.addEventListener('click', function(){
    state.muted = !state.muted;
    localStorage.setItem(MUTE_KEY, state.muted ? '1' : '0');
    paintMuteBtn();
    if (masterGain) masterGain.gain.value = state.muted ? 0 : 1;
  });

  /* settings panel */
  var settingsBtn = $('settings-btn');
  var settingsPanel = $('settings-panel');
  settingsBtn.addEventListener('click', function(){
    var open = settingsPanel.classList.toggle('open');
    settingsBtn.setAttribute('aria-expanded', String(open));
    settingsPanel.setAttribute('aria-hidden', String(!open));
    if (open) hideProfile();
  });
  document.addEventListener('click', function(e){
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && !settingsBtn.contains(e.target)){
      settingsPanel.classList.remove('open');
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  function wireSwitch(el, initial, onChange){
    var checked = initial;
    el.setAttribute('aria-checked', String(checked));
    function toggle(){
      checked = !checked;
      el.setAttribute('aria-checked', String(checked));
      onChange(checked);
    }
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    });
  }

  wireSwitch($('theme-switch'), true, function(isDark){
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // re-derive colors that were sampled from CSS at build time
    setTimeout(recolorForTheme, 10);
  });

  wireSwitch($('motion-switch'), reduceMotion, function(isReduced){
    ambientEnabled = !isReduced;
    needsRender = true;
  });

  function recolorForTheme(){
    var geo = pointCloud.geometry;
    var colors = geo.attributes.aColor.array;
    NODES.forEach(function(node){
      var c = hexToVec(catColorHex(node.category));
      var i = node._idx;
      colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    });
    geo.attributes.aColor.needsUpdate = true;

    var lineColors = lineBase.geometry.attributes.color.array;
    EDGES.forEach(function(e, idx){
      var c = hexToVec(catColorHex(nodeById[e.a].category));
      lineColors[idx*6] = c.r; lineColors[idx*6+1] = c.g; lineColors[idx*6+2] = c.b;
      lineColors[idx*6+3] = c.r; lineColors[idx*6+4] = c.g; lineColors[idx*6+5] = c.b;
    });
    lineBase.geometry.attributes.color.needsUpdate = true;
    lineHighlight.material.color = new THREE_.Color(cssVar('--accent'));

    document.querySelectorAll('.chip-dot').forEach(function(dot, i){
      dot.style.background = cssVar(CATEGORIES[i].color);
    });

    needsRender = true;
  }

  /* accessible list view (also acts as no-WebGL fallback) */
  var listBtn = $('list-toggle-btn');
  var listView = $('list-view');
  listBtn.addEventListener('click', function(){ toggleListView(); });

  function toggleListView(force){
    var show = typeof force === 'boolean' ? force : !listView.classList.contains('active');
    listView.classList.toggle('active', show);
    listBtn.setAttribute('aria-pressed', String(show));
    if (show) buildListView();
  }

  function buildListView(){
    var grid = $('list-grid');
    grid.innerHTML = '';
    CATEGORIES.forEach(function(cat){
      var group = document.createElement('div');
      group.className = 'list-group';
      var heading = document.createElement('h2');
      heading.innerHTML = '<span class="list-group-dot" style="background:' + cssVar(cat.color) + '"></span>' + cat.label;
      group.appendChild(heading);
      NODES.filter(function(n){ return n.category === cat.id; }).forEach(function(node){
        var btn = document.createElement('button');
        btn.className = 'list-item';
        var connText = node.linked.size ? (node.linked.size + ' documented connection' + (node.linked.size === 1 ? '' : 's')) : 'grouped by sector only';
        btn.innerHTML = '<div class="n">' + node.name + '</div><div class="r">' + node.role + ' &middot; ' + connText + '</div>';
        btn.addEventListener('click', function(){
          toggleListView(false);
          selectNode(node.id);
        });
        group.appendChild(btn);
      });
      grid.appendChild(group);
    });
  }

  // little starfield that plays behind the loading screen, warps out once the map's ready
  // stars light up starting from the centre and radiating outward, each one TWINKLING into
  // existence (flickering up, not just fading in) — no spinner anymore, this IS the loading state
  var INTRO_BUILD_MS = 1500; // stars start sparse and trickle, then the pace visibly picks up near the end
  function initIntroStars(){
    var canvas = document.getElementById('intro-stars');
    if (!canvas) return function(){};
    var ctx = canvas.getContext('2d');
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var cx = w / 2, cy = h / 2;
    var coreRadius = Math.min(w, h) * 0.45;
    var maxDist = Math.sqrt(cx * cx + cy * cy);
    var count = Math.min(900, Math.floor((w * h) / 1650)); // dense field — sense of scale
    var stars = [];
    for (var i = 0; i < count; i++){
      var inCore = Math.random() < 0.7; // most stars cluster toward the middle, like the reference pic
      var x, y;
      if (inCore){
        var ang = Math.random() * Math.PI * 2;
        var rad = ((Math.random() + Math.random() + Math.random()) / 3) * coreRadius; // bunches toward centre
        x = cx + Math.cos(ang) * rad;
        y = cy + Math.sin(ang) * rad;
      } else {
        x = Math.random() * w;
        y = Math.random() * h;
      }
      // distance from centre decides WHEN a star lights up — centre first, edges last, with a
      // little jitter so it doesn't look like a perfectly rigid sweep
      var distFrac = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxDist;
      // a handful of slightly bigger/brighter anchor stars, still plain white — no colour tint at all
      var isHero = inCore && Math.random() < 0.028;
      // rough depth cue — some stars sit "further back", smaller and dimmer, others feel closer
      var depth = 0.5 + Math.random() * 0.5;
      stars.push({
        x: x, y: y,
        r: isHero ? (Math.random() * 0.7 + 1.6) : inCore ? (Math.random() * 1.1 + 0.4) * depth : (Math.random() * 0.8 + 0.25) * depth,
        glow: isHero ? 4 : 0,
        depth: depth,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.8,
        // pow(distFrac, 0.6) instead of a straight line — compresses most stars into a later,
        // denser window so the first beat is sparse and slow, then the rest rush in near the end
        appearAt: reduceMotion ? 0 : (Math.pow(distFrac, 0.6) * INTRO_BUILD_MS * 0.82 + Math.random() * INTRO_BUILD_MS * 0.18)
      });
    }
    var introRaf = null;
    function draw(t){
      ctx.clearRect(0, 0, w, h);
      stars.forEach(function(s){
        if (t < s.appearAt) return; // hasn't lit up yet in the centre-out build
        var sinceAppear = t - s.appearAt;
        var envelope = reduceMotion ? 1 : Math.min(1, sinceAppear / 380); // snappier pop-in than before
        // small, restrained flicker — real starlight shimmers subtly, it doesn't pulse like a beacon
        var flicker = reduceMotion ? 1 : Math.max(0,
          0.68 + 0.17 * Math.sin(t * 0.0011 * s.speed + s.phase) + 0.1 * Math.sin(t * 0.0029 * s.speed + s.phase * 1.7)
        );
        ctx.globalAlpha = envelope * flicker * (0.55 + 0.45 * (s.depth || 1)); // further-back stars sit a bit dimmer
        ctx.fillStyle = '#E7E9F0'; // plain cool white, nothing tinted
        if (s.glow){ ctx.shadowBlur = s.glow; ctx.shadowColor = 'rgba(220,224,236,0.55)'; }
        else { ctx.shadowBlur = 0; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (!reduceMotion) introRaf = requestAnimationFrame(draw);
    }
    if (reduceMotion){
      draw(0); // full density immediately, no trickle-in, twinkle loop or zoom
      canvas.classList.add('growing');
    } else {
      introRaf = requestAnimationFrame(draw);
      requestAnimationFrame(function(){ canvas.classList.add('growing'); }); // kicks off the slow continuous zoom
    }
    // name/tagline/warp timing is all driven from boot() now, not from here
    return function stop(){ if (introRaf) cancelAnimationFrame(introRaf); };
  }
  var stopIntroStars = initIntroStars();

  // 7. BOOT — kicks everything off once the fonts + webgl are ready
  function boot(){
    var hasWebGL = (function(){
      try {
        var c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch(e){ return false; }
    })();

    buildLegend();
    updateNodeCountLabel();

    if (!hasWebGL || !window.THREE){
      // graceful fallback: skip 3D entirely, show accessible list
      stopIntroStars();
      $('loading').style.display = 'none';
      $('hint').style && ($('hint').style.display = 'none');
      toggleListView(true);
      var note = document.createElement('p');
      note.className = 'row-sub';
      note.style.cssText = 'max-width:520px;margin:0 auto 18px;text-align:center;';
      note.textContent = 'Showing the accessible list view — 3D rendering isn\u2019t available on this device or browser.';
      $('list-grid').parentNode.insertBefore(note, $('list-grid'));
      return;
    }

    computeLayout();
    initScene();
    refreshPointAttributes();
    tick();

    // warps into the map — now only ever fired by the enter button, not a timer
    function warpIntoMap(){
      var loading = $('loading');
      var flash = $('intro-flash');
      if (flash) flash.classList.add('flash'); // quick bloom right at the cut — the "arrival" beat
      loading.classList.add('warp-out'); // fade + zoom, feels like pushing through into the map
      setTimeout(function(){
        loading.style.display = 'none';
        stopIntroStars();
      }, 1560); // matches the warp-out transition duration in style.css so the fade never cuts off early
    }

    // sequence once the field's filled in: name resolves, then the enter button fades in below it and waits
    requestAnimationFrame(function(){
      setTimeout(function(){
        var titleEl = $('intro-title');
        if (titleEl) titleEl.classList.add('visible');

        setTimeout(function(){
          var enterBtn = $('intro-enter');
          if (enterBtn){
            enterBtn.classList.add('visible');
            enterBtn.addEventListener('click', function handleEnter(){
              enterBtn.removeEventListener('click', handleEnter); // one shot — no double-firing the warp
              enterBtn.disabled = true;
              warpIntoMap();
            });
          }
        }, 700); // short hold after the name lands before the button shows up
      }, INTRO_BUILD_MS + 200); // waits for the star field to actually fill in first
    });
  }

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(boot).catch(boot);
  } else {
    boot();
  }

})();
