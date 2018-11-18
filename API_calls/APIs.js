import {AsyncStorage} from "react-native";
import Expo from 'expo';

const apiURL = "http://10.0.0.228:1337/api";
module.exports.apiURL = apiURL;

const _bootstrapAsync = async (props) => {
    const userToken = await AsyncStorage.getItem('userToken');

    if (userToken != null) {

    var settings = {
  method: 'GET',
  headers: {
    'Authorization': userToken
  }
  };

  var apiURL = 'http://10.0.0.228:1337/api';

  try {
    let response = await fetch(apiURL + '/user', settings)
    .then( (response) => 
      {
        if (response.status === 401)
        {
          props.navigation.navigate('Auth');
        } else
        {
          response.json()
          .then((response) => console.log(response));
          props.navigation.navigate('Main');
        }
      }
      );
  } catch (error) {
    console.error(error);
  }

}
 else 
{
  props.navigation.navigate('Auth');
}
    
  };
  module.exports._bootstrapAsync = _bootstrapAsync;

  const login = async function(username, password, props) 
  {
      const settings =    {
                              method: "POST",
                              headers: {
                                          "Content-Type": "application/JSON"
                                       },
                              body: JSON.stringify({
                                                      email: username,
                                                      password: password
                                                  })
                          };
    
        fetch(apiURL + "/user/login", settings)
          .then(response => response.json())
          .then(response => {
            //console.log(response);
    
            if (response.success) {
              AsyncStorage.setItem("userToken", response.token);
              AsyncStorage.setItem("userid", response.user.id);
              Expo.SecureStore.setItemAsync("userToken", response.token);
  
              populate();
    
              // call to sendbird action to add the user to sendbird
              props.sendbirdLogin({ userId: response.user.id, nickname: response.user.firstName });
    
              props.navigation.navigate("Main");
            } else {
              switch (response.error) {
                case "Not registered":
                  alert(
                    'This Username is not registered\nGo to "Register" to make an account'
                  );
                  break;
                case "invalid password":
                  alert("Incorrect password");
                  break;
                case "Please enter a password to login":
                  alert("Please enter your password");
                  break;
                case "Please enter an email to login":
                  alert("Please enter your email");
                  break;
                case "A valid email  was not entered":
                  alert("Please enter a valid email\n(abc@xyz.com)");
                  break;
              }
            }
          })
          .catch(error => console.error("Error:", error));
  };
  module.exports.login = login;

//Function that is used to populate when the user logs in.
populate = async () => 
{
    userToken = AsyncStorage.getItem("userToken");

    console.log(userToken + "testing ya basha");

    if (userToken != "") {
      const populate = {
                            method: "GET",
                            headers: {
                                        Authorization: userToken,
                                        "Content-Type": "application/json"
                                    }
                        };

      fetch(apiURL + "/user/popconn", populate);
    }

};
  module.exports.populate = populate;

const Register = async (inputs, props) => 
{
    //////////////////////REGISTRATION API CALL////////////////////////////


    
            if (inputs["Username"] == "" || inputs["Username"] == undefined) 
            {
                alert("Please enter an email to register");
            } else 
            {
                if (inputs["Password"] == "" || inputs["Password"] == undefined) 
                {   
                    alert("Please enter an password to register");
                } else 
                {
                    if (inputs["Password"] == inputs["Repassword"]) 
                    {

                        var settings = 
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/JSON'
                            },
                            body: JSON.stringify
                            ({
                                'email' : inputs["Username"],
                                'password' : inputs["Password"]
                            })
                        };
                        console.log(inputs);
                        fetch(apiURL + '/user', settings)
                        .then((response) => response.json())
                        .then((response)  => 
                            { 
                                if (response.success) 
                                {
                                    console.log(inputs);
                                    AsyncStorage.setItem('userToken', response.token);
                                    props.navigation.navigate('RCP');
                                } else 
                                {
                                    switch (response.error) 
                                    {
                                        case "A valid email was not entered.":
                                            alert("A valid email was not entered.");
                                        break;
                                        case "User already exists with that email":
                                            alert("User already exists with that email");
                                        break;
                                    }
                                }
                            }
                        )
                        .catch((error) => console.error('Error:', error));

                    } else 
                    {
                        alert("Passwords do not match!\nPlease try again.");
                    }
                }
            }
};
module.exports.Register = Register;

const CompleteProfile = async (first, last, interests, industry, LF, bio, props) => {

    if (first == "" || last == "") 
    {
        alert("Please enter your first & last name to register");
    } else 
    {

    const userToken = await AsyncStorage.getItem('userToken');
    let i = 0;
    let interest = '[';
    let ind = '[';
    let lf = '[';

    Object.keys(interests).map(function(keyName) {

        interest += (i? ',': '') + "\"" + keyName + "\"";
        i++;

      });

    i = 0;
    interest += "]";

    Object.keys(industry).map(function(keyName) {

        ind += (i? ',': '') + "\"" + keyName + "\"";
        i++;

      });

    i = 0;
    ind += "]";

    Object.keys(LF).map(function(keyName) {

        lf += (i? ',': '') + "\"" + keyName + "\"";
        i++;

      });

    i = 0;
    lf += "]";

    interest = JSON.parse(interest);
    ind = JSON.parse(ind);
    lf = JSON.parse(lf);

    var settings = {
        method: 'PUT',
        headers: {
            'Authorization': userToken,
            'Content-Type': 'application/JSON'
        },
        body: JSON.stringify({
            "firstName" : first,
            "lastName" : last,
            "interests" : interest,
            "lookingFor": lf,
            "industry"  : ind,
            "bio" : bio
        })
        };

        console.log(settings);

        fetch(apiURL + '/user', settings)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .then(async () => populate())
        .then(props.navigation.navigate('Main'));

    }

  };
  module.exports.CompleteProfile = CompleteProfile;

  const likedUser = async (currUserID) => {
    if (userToken != null) {
      console.log("This is liked user " + currUserID);


      var updateUser = {
        method: 'PUT',
        headers: {
          'Authorization': userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'liked' : [currUserID]
          })
      };
      await fetch(apiURL + '/user', updateUser).then(response => response.json())
      .then(async(response) => {console.log(response);})
    }
  };
  module.exports.likedUser = likedUser;

  //Function that is used to report a dislike to the server
  const dislikedUser = async (currUserID) => {

    //userToken = await AsyncStorage.getItem('userToken');

    console.log("This is disliked user" + currUserID);

    if (userToken != null) {
      console.log("This is disliked user" + currUserID);
      var updateUser = {
        method: 'PUT',
        headers: {
          'Authorization': userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'disliked' : [currUserID]
          })
      }
      fetch(apiURL + '/user', updateUser)
    }
  };
  module.exports.dislikedUser = dislikedUser;