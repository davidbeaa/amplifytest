import React, { useEffect, useState } from "react";
import "./App.css";
import Amplify, { Auth, Storage } from "aws-amplify";

const awsconfig = {
  aws_project_region: "us-east-1",
  aws_cognito_region: "us-east-1",
  aws_user_pools_id: process.env.REACT_APP_COGNITO_USER_POOLS_ID,
  aws_user_pools_web_client_id:
    process.env.REACT_APP_COGNITO_USER_POOLS_WEB_CLIENT_ID,
  oauth: {
    domain: process.env.REACT_APP_COGNITO_DOMAIN,
    scope: [
      "phone",
      "email",
      "openid",
      "profile",
      "aws.cognito.signin.user.admin",
    ],
    redirectSignIn: process.env.REACT_APP_URL_REDIRECT_SIGNIN,
    redirectSignOut: process.env.REACT_APP_URL_REDIRECT_SIGNOUT,
    responseType: "code",
  },
  federationTarget: "COGNITO_USER_POOLS",
  Storage: {
    AWSS3: {
      bucket: "webbackup2", //REQUIRED -  Amazon S3 bucket name
      region: "us-east-1", //OPTIONAL -  Amazon service region
    },
  },
};

Amplify.configure(awsconfig);

Amplify.Logger.LOG_LEVEL = "DEBUG";

export type DataUserType = {
  idUser: string;
  emailUser: string;
};

function App() {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [dataUser, setDataUSer] = useState<DataUserType>();

  useEffect(() => {
    const redirectIdp = () => {
      Auth.federatedSignIn();
    };

    const ionViewCanEnter = async () => {
      try {
        const userLogged = await Auth.currentAuthenticatedUser();

        if (userLogged.getUsername()) {
          const id = userLogged.getUsername().split("_")[1];
          const us: DataUserType = {
            emailUser: userLogged.attributes.email.toLowerCase(),
            idUser: id,
          };
          setUser(userLogged);
          setDataUSer(us);
          console.log("informacion", userLogged);
          /*  userRegister(
            idpUser.storage[
              `CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${idpUser.username}.idToken`
            ]
          ); */
          setToken(
            userLogged.storage[
              `CognitoIdentityServiceProvider.${awsconfig.aws_user_pools_web_client_id}.${userLogged.username}.idToken`
            ]
          );
          Storage.configure(awsconfig.Storage);
          const resp = await Storage.get("index.html")
            .then((data) => console.log(data))
            .catch((e) => console.log(e));
          console.log("resp", resp);
        }
      } catch (err) {
        redirectIdp();
      }
    };

    ionViewCanEnter();
  }, []);

  if (!user) return <div>console.log("ERROR");</div>;
  return <div>console.log("OK");</div>;
}

export default App;
