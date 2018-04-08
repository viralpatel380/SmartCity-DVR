$(document).ready(function(){
  //initialize the firebase app
  var config = {
     apiKey: "AIzaSyDWTFbwQa6ucCrlgQNV-NJALahbRjQ5H0k",
      authDomain: "fir-bad72.firebaseapp.com",
      databaseURL: "https://fir-bad72.firebaseio.com",
      projectId: "fir-bad72",
      storageBucket: "fir-bad72.appspot.com",
      messagingSenderId: "714065987518"
  };
  firebase.initializeApp(config);

  //create firebase references
  var Auth = firebase.auth(); 
  var dbRef = firebase.database();
  var contactsRef = dbRef.ref('users/salesPersonNode')
  var usersRef = dbRef.ref('users/salesPersonNode')
  var auth = null;

  //Register
  $('#doRegister').on('click', function (e) {
    e.preventDefault();
    $('#registerModal').modal('hide');
    $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
    $('#messageModal').modal('show');
    var data = {
      email: $('#registerEmail').val(), //get the email from Form
      firstName: $('#registerFirstName').val(), // get firstName
      lastName: $('#registerLastName').val(), // get lastName
    };
    var passwords = {
      password : $('#registerPassword').val(), //get the pass from Form
      cPassword : $('#registerConfirmPassword').val(), //get the confirmPass from Form
    }
    if( data.email != '' && passwords.password != ''  && passwords.cPassword != '' ){
      if( passwords.password == passwords.cPassword ){
        //create the user
        
        firebase.auth()
          .createUserWithEmailAndPassword(data.email, passwords.password)
          .then(function(user){
            //now user is needed to be logged in to save data
            console.log("Authenticated successfully with payload:", user);
            auth = user;
            //now saving the profile data
            usersRef
              .child(user.uid)
              .set(data)
              .then(function(){
                console.log("User Information Saved:", user.uid);
              })
            $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
            //hide the modal automatically
            setTimeout(function() {
              $('#messageModal').modal('hide');
              $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
              contactsRef.child(auth.uid)
                .on("child_added", function(snap) {
                  console.log("added", snap.key, snap.val());
                  $('#contacts').append(contactHtmlFromObject(snap.val()));
                });
            }, 500);
            console.log("Successfully created user account with uid:", user.uid);
            $('#messageModalLabel').html(spanText('Successfully created user account!', ['success']))
          })
          .catch(function(error){
            console.log("Error creating user:", error);
            $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
          });
      } else {
        //password and confirm password didn't match
        $('#messageModalLabel').html(spanText("ERROR: Passwords didn't match", ['danger']))
      }
    }  
  });

  //Login
  $('#doLogin').on('click', function (e) {
    e.preventDefault();
    $('#loginModal').modal('hide');
    $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
    $('#messageModal').modal('show');

    if( $('#loginEmail').val() != '' && $('#loginPassword').val() != '' ){
      //login the user
      var data = {
        email: $('#loginEmail').val(),
        password: $('#loginPassword').val()
      };
      firebase.auth().signInWithEmailAndPassword(data.email, data.password)
        .then(function(authData) {
          console.log("Authenticated successfully with payload:", authData);
          auth = authData;
          $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
          setTimeout(function () {
            $('#messageModal').modal('hide');
            $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
            contactsRef.child(auth.uid)
              .on("child_added", function(snap) {
                console.log("added", snap.key, snap.val());
                $('#contacts').append(contactHtmlFromObject(snap.val()));
              });
          })
        })
        .catch(function(error) {
          console.log("Login Failed!", error);
          $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
        });
    }
  });


  //var ref = new Firebase("https://fir-bad72.firebaseio.com");
  firebase.auth().onAuthStateChanged(function(authData) {
  if (authData) {
    console.log("viral " + authData.uid + " is logged in with " + authData.provider);
    console.log("Authenticated successfully with payload:", authData);
          auth = authData;
          $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
          setTimeout(function () {
            $('#messageModal').modal('hide');
            $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
            contactsRef.child(auth.uid)
              .on("child_added", function(snap) {
                console.log("added", snap.key, snap.val());
                $('#contacts').append(contactHtmlFromObject(snap.val()));
              });
          })
  } else {
    console.log("User is logged out");
  }
});

  //save contact
  $('.addValue').on("click", function( event ) {  
    event.preventDefault();
    if( auth != null ){
      if( $('#name').val() != '' || $('#email').val() != '' ){
        contactsRef.child(auth.uid)
          .push({
           
            activeStatus: $('#activeStatus').val(),
            dealerVisit: $('#dealerVisit').val(),
            place: $('#place').val(),
            planDate: $('#planDate').val(),
            porposeOfVisit: $('#porposeOfVisit').val()
           
          })
          document.contactForm.reset();
      } else {
        alert('Please fill at-lease name or email!');
      }
    } else {
      //inform user to login
    }
  });
})
 
//prepare contact object's HTML
function contactHtmlFromObject(contact){
  console.log( contact );
  var html = '';
  html += '<li class="list-group-item contact">';
    html += '<div>';
      html += '<p>'+'<span><b>PlanDate:</b></span>'+contact.planDate+'</p>';
      html += '<p>'+'<span><b>Place:</b></span>'+contact.place+'</p>';
      html += '<p>'+'<span><b>DealerVisit:</b></span>'+contact.dealerVisit+'</p>';
      html += '<p>'+'<span><b>PorposeOfVisit:</b></span>'+contact.porposeOfVisit+'</p>';
     
     html += '</div>';
  html += '</li>';
  return html;

}

$('.contacts').on("click", function( event ) {  
  event.preventDefault();
  window.location.replace('home.html');
});

function spanText(textStr, textClasses) {
  var classNames = textClasses.map(c => 'text-'+c).join(' ');
  return '<span class="'+classNames+'">'+ textStr + '</span>';
}
