Here is how you can use the utility to generate tokens:

Setup:

1. Extract the file and go to the extracted folder on command prompt.
2. Install nvm. For example if you are using mac then:
	1. using homebrew you can run this command: "brew install nvm"
	2. Follow the instructions on output terminal.
3. Install node using nvm (installed at the previous step):
	1. Run this command on terminal: "nvm install v6.11.3"
	2. To use this node version type "nvm alias default 6.11.3"

Generate tokens:
Here are some examples to generate different types of tokens:

1. Admin tokens:
Run this command to generate a token with scope as "Identity:SCIM Identity:Organization contact-center-context:pod_read spark:kms":

node bin/admintoken.js --user <Admin user name> --password <Password> --orgid <Org Id> --scopes "Identity:SCIM Identity:Organization contact-center-context:pod_read spark:kms"

2. User Token

node bin/token.js --user <user name> --password <Password> --orgid <Org Id> --scopes "contact-center-context:pod_write contact-center-context:pod_read webex-squared:kms_read webex-squared:kms_bind webex-squared:kms_write spark:kms"
