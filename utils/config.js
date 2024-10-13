require("dotenv").config();
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");


// Initialize STS client to verify credentials
const stsClient = new STSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function checkAWSCredentials() {
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);
    console.log("Logged in successfully! AWS Account ID:", response.Account);
    return true;
  } catch (error) {
    console.error(
      "Error: Failed to log in to AWS. Check your credentials.",
      error,
    );
    return false;
  }
}

const PORT = process.env.PORT;
const MAX_FILE_SIZE = process.env.AWS_MAX_FILE_SIZE;

let awsCredentialsValid;
checkAWSCredentials()
  .then((isValid) => {
    awsCredentialsValid = isValid;
    if (isValid) {
      console.log(
        "AWS credentials are valid. Application is ready to use AWS services.",
      );
    } else {
      console.error(
        "AWS credentials are invalid. AWS services will not be available.",
      );
    }
  })
  .catch((error) => {
    console.error(
      "An unexpected error occurred while checking AWS credentials:",
      error,
    );
    awsCredentialsValid = false;
  });

module.exports = {
  PORT,
  MAX_FILE_SIZE,
  awsConfig: {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  isAWSConfigValid: () => awsCredentialsValid,
};
