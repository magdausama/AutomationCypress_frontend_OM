

function getToken() {
  let data = {
    grant_type: 'password',
    client_id: 'phelix_frontend',
    username: Cypress.env('username'),
    password: Cypress.env('password')
  };
  return cy.request({
    method: 'POST',
    url: 'https://sso-dev.pixelogicplayground.com/auth/realms/phelix/protocol/openid-connect/token',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data
  }).then((response) => response.body.access_token);
}

function createNewTitle(url, body) {
  return getToken().then((accessToken) => {
    return cy.request({
      method: 'POST',
      url: url,
      body: body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
  });
};

let possibleValues = {
  priorities: null,
  billingClients: null,
  productionStatuses: null,
  destinations: null,
  countries: null,
  territories: null,
  vendorLocations: null,
  languages: null,
  releaseTypes: null,
  lineOfBusinesses: null
};
let randomValues = {};
let billingClientAlias, prioritiesAlias, productionStatusesAlias, destinationsAlias, countriesAlias, territoriesAlias, vendorLocationAlias,languageAlias,releaseTypeAlias,lineOfBusinessAlias;
// describe('', function() {
//   let url = 'https://coredb-dev.pixelogicplayground.com/api/v1/admin/titles/?add-additional-clients=false';
  
//   // Run before each test
//   beforeEach(function() {
//     let body = {
//       productType: "Movie",
//       alternative_name_keys: [],
//       external_system_keys: [],
//       clients_keys: ["5", "57"],
//       title: "CypressTest3",
//       sortTitle: "CypressTest3",
//       clients: [
//         { client: { id: "5" } },
//         { client: { id: "57" } }
//       ],
//       originalLanguage: { id: "18" },
//       country: { id: "1233" },
//       releaseYear: 2017,
//       aspectRatio: {},
//       frameRate: {},
//       clients_array: []
//     };

//     createNewTitle(url, body);
//   })});




function interceptAPI(url, alias) {
  cy.intercept('GET', url).as(alias);
  return '@' + alias;
}
function extractDataFromResponse(interceptAlias, field) {
  let extractedValues = [];

  cy.wait(interceptAlias).then((interception) => {
      const responseBody = interception.response.body;

      // Check if responseBody is defined
      if (!responseBody) {
          throw new Error('The response body is undefined.');
      }

      if (typeof field === 'function') {
          extractedValues = field(responseBody);
      } else if (Array.isArray(responseBody)) {  // Check if responseBody is an array
          extractedValues = responseBody.map(item => item[field]);
      } else {
          throw new Error('Expected the response body to be an array.');
      }
  });

  return cy.wrap(extractedValues);
}


function getRandomElement(arr) {
  if (arr && arr.length) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  return null;  // if arr is empty or not an array
}
describe('Get All values of each field', () => {
  before(() => {
    cy.visit('/operations-manager');
    cy.login(Cypress.env('username'), Cypress.env('password'));
    cy.get('.App-header-title').should('be.visible');
     billingClientAlias = interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/clients?isBillingClient=true','billingClient');
     prioritiesAlias=interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/priorities','priorities');
     productionStatusesAlias= interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/production-statuses','productionStatuses');
     destinationsAlias =interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/destinations','destinations');
     countriesAlias=interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/countries','countries');
     territoriesAlias= interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/territories', 'territories');
     vendorLocationAlias= interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/vendors/pixelogic/vendor-locations','vendorLocation');
     languageAlias=interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/languages','language');
     releaseTypeAlias= interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/release-types','releaseType');
     lineOfBusinessAlias=interceptAPI('https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/line-of-businesses','lineOfBusiness');
    cy.get('.phelix-om-antd-v4-btn-primary').click();
  });

  it('should populate possible values from multiple endpoints', () => {

    cy.wait(billingClientAlias)
    .then((interception) => {
      possibleValues.billingClients = extractDataFromResponse(interception, 'name');
    });
    cy.wait(prioritiesAlias)
    .then((interception) => {
      possibleValues.priorities = extractDataFromResponse(interception, body => body.slice(0, -2).map(item => item.name));
    });
    cy.wait(productionStatusesAlias)
      .then((interception) => {
        possibleValues.productionStatuses = extractDataFromResponse(interception, 'name');
      });
      cy.wait(destinationsAlias)
      .then((interception) => {
        possibleValues.destinations = extractDataFromResponse(interception, 'label');
      });
      cy.wait(countriesAlias)
      .then((interception) => {
        possibleValues.countries = extractDataFromResponse(interception, 'name');
      });

      cy.wait(territoriesAlias)
      .then((interception) => {
        possibleValues.territories = extractDataFromResponse(interception, 'name');
      });

      cy.wait(vendorLocationAlias)
      .then((interception) => {
        possibleValues.vendorLocations = extractDataFromResponse(interception, 'city');
      });
      cy.wait(languageAlias)
      .then((interception) => {
        possibleValues.languages = extractDataFromResponse(interception, 'value');
      });

    const extractLabelsFromReleaseType = (responseBody) => {
      return responseBody.map(item => ({
          label: item.label,
          childLabels: item.children ? item.children.map(child => child.label) : []
      }));
  }; 

  cy.wait(releaseTypeAlias)
  .then((interception) => {
    possibleValues.releaseTypes = extractDataFromResponse(interception, extractLabelsFromReleaseType).then(values => {
      possibleValues.releaseTypes = values;
    });
  });
   
   const extractLabelsFromLineOfBusiness = (responseBody) => {
      return responseBody.map(item => ({
        label: item.name,
        childLabels: item.children ? item.children.map(child => child.name) : []
      }));
    };

    cy.wait(lineOfBusinessAlias)
  .then((interception) => {
    possibleValues.lineOfBusinesses = extractDataFromResponse(interception, extractLabelsFromLineOfBusiness).then(values => {
      possibleValues.lineOfBusinesses = values;
    });
  });

  cy.log("pos", JSON.stringify(possibleValues));
  });
});
describe('Generate Random Value for each field', () => {

  it('should populate random values from possibleValues', () => {

    // Ensuring all values are populated first
    cy.wrap(possibleValues).should((values) => {
      for (const key in values) {
        expect(values[key]).to.not.be.null; // making sure each value is populated
      }
    }).then((values) => {
      for (const key in values) {
        randomValues[key] = getRandomElement(values[key]);
      }
      cy.log("random", JSON.stringify(randomValues));
    });
  });
});

//     it('should create a job', () => {
//     cy.visit('/operations-manager');
//     cy.login(Cypress.env('username'), Cypress.env('password'));
//     cy.get('.App-header-title').should('be.visible');
//     cy.wait(3000);
//     cy.get('.phelix-om-antd-v4-btn-primary').click();
//     cy.get('.ant-input').type('CypressTest');
//     cy.get('[test-id="title-summary-0"]').click();
//     cy.get("#priority").click();
//     cy.get(')
//     aria-activedescendant="priority_list_1"
//     // cy.get(".phelix-om-antd-v4-input test-id-job-name").type("Hello");
//     // cy.get(".phelix-om-antd-v4-cascader-picker-label").click()   //line of buss
//     // cy.get("#productionStatus").click(); 
//      //cy.get("#destination").click();
//      //cy.get("#pixelogicManagers").type("");
//      //cy.get("#billingClient").click();
//      //cy.get('#releaseType').click();
//      //cy.get("#vendorLocation").click();
//      //cy.get("initialDueDate").click();
//      cy.get('[title="2023-09-04"]').click();
//     cy.get('.phelix-om-antd-v4-picker-ok').click();

//  ///////////////////////////////////TASK1/////////////////////////////////
//   //  cy.get("#b38825c2-1920-a003-a375-12c8ee1d94d6_taskType").click();
//     cy.get('[data-testid="test-id-task-sla"]').type("1h");


//     ////////////////////////////TASK2///////////////////////
//     cy.get('#b38825c2-1920-a003-a375-12c8ee1d94d6_taskType').trigger('mouseover');         //hover 
//     cy.get('[data-testid="additional-details-tabs"]').click();
//     cy.get('[data-menu-id=rc-menu-uuid-20513-25-tmp_key-0]').click();
    
      
//     //save every thing
//     cy.get('[data-testid="save-job-btn"]').click();
//     });
