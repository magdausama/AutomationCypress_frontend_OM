// // Function to get access token
// function getToken() {
//   let data = {
//     grant_type: 'password',
//     client_id: 'phelix_frontend',
//     username: Cypress.env('username'),
//     password: Cypress.env('password')
//   };

//   return cy.request({
//     method: 'POST',
//     url: 'https://sso-dev.pixelogicplayground.com/auth/realms/phelix/protocol/openid-connect/token',
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//     },
//     body: data
//   }).then((response) => response.body.access_token);
// }


// function createNewTitle(url, body) {
//   return getToken().then((accessToken) => {
//     return cy.request({
//       method: 'POST',
//       url: url,
//       body: body,
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${accessToken}`
//       }
//     });
//   });
// };

// describe('Create New Title for each new job', function() {
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


it('get values', () => {
    let priorityValues = [];
    let billingClientValues = [];
    let productionStatusValues=[];
    let destinationValues=[];
    let countryValues=[];
    let territoriesValues=[];
    let vendorLocationValues=[];
    let languageValues=[];
    let releaseTypeValues=[];
    let lineOfBusinessValues=[];

    cy.intercept('GET', 'https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/priorities', (req) => {
    req.continue((res) => {
    const relevantItems = res.body.slice(0, -2);
    priorityValues = relevantItems.map(item => item.name);
    });
  }).as('prioritiesRequest');


  cy.intercept('GET', 'https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/clients?isBillingClient=true', (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    billingClientValues = relevantItems.map(item => item.name);
    });
  }).as('billingClientRequest');

  cy.intercept('GET', 'https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/production-statuses', (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    productionStatusValues = relevantItems.map(item => item.name);
    });
  }).as('productionStatusRequest');

  cy.intercept('GET','https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/destinations', (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    destinationValues = relevantItems.map(item => item.label);
    });
  }).as('destinationRequest');


  cy.intercept('GET','https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/countries', (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    countryValues = relevantItems.map(item => item.name);
    });
  }).as('countryRequest');
  


  cy.intercept('GET','https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/territories' , (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    territoriesValues = relevantItems.map(item => item.name);
    });
  }).as('territoriesRequest');




  cy.intercept('GET','https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/vendors/pixelogic/vendor-locations' , (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    vendorLocationValues = relevantItems.map(item => item.city);
    });
  }).as('vendorLocationRequest');


  cy.intercept('GET','https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/languages' , (req) => {
    req.continue((res) => {
    const relevantItems = res.body;
    languageValues = relevantItems.map(item => item.value);
    });
  }).as('languageRequest');



  const extractLabelsFromReleaseType = (responseBody) => {
    return responseBody.map(item => ({
        label: item.label,
        childLabels: item.children.map(child => child.label)
    }));
};

cy.intercept('GET', 'https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/release-types', (req) => {
    req.continue((res) => {
        releaseTypeValues = extractLabelsFromReleaseType(res.body);
    });
}).as('releaseTypeRequest');


const extractLabelsFromLineOfBusiness= (responseBody) => {
  return responseBody.map(item => ({
      label: item.name,
      childLabels: item.children.map(child => child.name)
  }));
};

cy.intercept('GET', 'https://phelix-api-v2-dev.pixelogicplayground.com/apis/v1/lookups/line-of-businesses', (req) => {
  req.continue((res) => {
    lineOfBusinessValues = extractLabelsFromLineOfBusiness(res.body);
  });
}).as('lineOfBusinessRequest');





  //------------------------Login & click on new job-------------------------//
  cy.visit('/operations-manager');
  cy.login(Cypress.env('username'), Cypress.env('password'));
  cy.get('.App-header-title').should('be.visible');
  cy.wait(5000);
  cy.get('.phelix-om-antd-v4-btn-primary').click();
  cy.wait(3000);

    //------------------------Calling alias-------------------------//

  cy.wait('@prioritiesRequest').then(() => {
    console.log(priorityValues);});
  cy.wait('@billingClientRequest').then(() => {
    console.log(billingClientValues);
;});
  cy.wait('@productionStatusRequest').then(() => {
    console.log(productionStatusValues);}); 
  cy.wait('@destinationRequest').then(() => {
    console.log(destinationValues);}); 
    cy.wait('@languageRequest').then(() => {
    console.log(languageValues);});
  cy.wait('@territoriesRequest').then(() => {
    console.log(territoriesValues); 
  });
  cy.wait('@countryRequest').then(() => {
    console.log(countryValues); 
  });
  cy.wait('@vendorLocationRequest').then(() => {
    console.log(vendorLocationValues); 
  });
  cy.wait('@releaseTypeRequest').then(() => {
    console.log(releaseTypeValues); 
  });
  cy.wait('@lineOfBusinessRequest').then(() => {
    console.log(lin); 
  });


})
// describe('login', function() {
//   beforeEach(() => {
//     cy.visit('/operations-manager');
//     cy.login(Cypress.env('username'), Cypress.env('password'));
//     cy.get('.App-header-title').should('be.visible');
// })})

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
