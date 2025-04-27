# site-configurator

This is a Electron/Next.js app that allows one to manage AWS SES templates and update AWS Lambda functions.  It even has a light theme for really dim screens.


![Site Configurtor Main Page](/screenshots/home.png)
![Configure AWS Credentials](/screenshots/awsCredentialSettings.png)
![Light and Dark Theme](/screenshots/lightAndDarkMode.png)


## AWS SES Template Management

This tool allows you to manage AWS SES templates.

![Create new email template](/screenshots/newEmailTemplate.png)
![Edit or delete existing email template](/screenshots/updateOrDeleteTemplate.png)


### Features

- List all templates in any region
- Create new template
- Edit existing template
- Delete template

## Lambda Deployment Request Tool

This is actually a very specific usecase for myself. 

This tool allows you to select an artifact in CodeArtifact, select an existing lambda function.  Put in a request to deploy that artifact to the selected lambda function via a message into EventBridge.  EventBridge rules will then trigger deployment based on information provided.


![Create new deployment request](/screenshots/requestDeployment.png)
![new deployment request successful](/screenshots/requestSuccess.png)


### Features

- Select artifact in CodeArtifact
- Select existing lambda function
- Request deployment via AWS EventBridge

## Todo

This tool is still very much work in progress.  

### General

- Need app icon
- Tests, need to create some tests for the project.
- need to clean up some console logging and better dialog integration with electron
- Responsive for smaller screens, not a high priority as a desktop app, will would like to add it at some point
- Leverage more of tailwind or at least more shareable CSS.  This project was done in 3 days, so there was more inline css than I'd hoped.
- Better error handling from the thunks

### Lambda Deployment Request Tool

- Add Support for Batch deployment

### AWS SES Template Management

- Need to sanitize the HTML input
- Need to add support for html file upload instead of a big text field
        




