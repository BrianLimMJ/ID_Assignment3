window.onload =  function(){
    $("#InfomationDetails").hide();
}
const APIKEY = '6028a9575ad3610fb5bb5fe3';

document.getElementById('contact-submit').addEventListener('click',function submitForm(e){
    
    e.preventDefault();

    let contactName = document.getElementById('contact-name').value;
    let contactEmail = document.getElementById('contact-email').value;
    let contactNumber = document.getElementById('contact-number').value;
    if(Number.isInteger(parseInt(contactNumber)) == false)
    {
      alert("Error contact number input was not a number");
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-email').value = '';
      document.getElementById('contact-number').value = '';
      document.getElementById("contact-msg").value= '';
      return;
    }
    let contactMessage = document.getElementById("contact-msg").value;
    
    let jsondata = {
        "name": contactName,
        'number': parseInt(contactNumber),
        "email": contactEmail,
        "message": contactMessage
      };

    let settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://contactform-b9e0.restdb.io/rest/contact",
    "method": "POST",
    "headers": {
        "content-type": "application/json",
        "x-apikey": APIKEY,
        "cache-control": "no-cache"
    },
    "processData": false,
    "data": JSON.stringify(jsondata)
    }
    
    $.ajax(settings).done(function (response) {
    console.log(response);
    });  
    alert('Thank you for contacting us, we will be with you shortly');
    
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-number').value = '';
    document.getElementById("contact-msg").value= '';

    $("#myForm").hide();
    $("#InfomationDetails").show();
    getContactInfo(1);
});
function getContactInfo(option){
    $("#InfomationDetailsContainer").empty();
    if (option == 1){
      $("#InfomationDetailsContainer").append('<lottie-player src="https://assets4.lottiefiles.com/packages/lf20_jFtJZy.json"  background="transparent"  speed="2"  style="width: 300px; height: 300px; margin:auto;"  loop autoplay></lottie-player>');
    }
    if (option == 2){
      $("#InfomationDetailsContainer").append('<lottie-player src="https://assets2.lottiefiles.com/temp/lf20_UWbx73.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px; margin:auto;"  loop  autoplay></lottie-player>');

    }
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://contactform-b9e0.restdb.io/rest/contact",
        "method": "GET",
        "headers": {
          "content-type": "application/json",
          "x-apikey": APIKEY,
          "cache-control": "no-cache"
        }
      }
      
      $.ajax(settings).done(function (response) {     
        $("#InfomationDetailsContainer").empty();
        if (response.length == 0){
            $("#InfomationDetailsContainer").append('<p id = "error-msg">There are none available</p>');
        }
        else{
            for (let i = 0; i < response.length ; i++) {
                $("#InfomationDetailsContainer").append('\
                <div class="InfomationDetailsCard">\
                <p>'+"Name: "+response[i].name +'<br>\
                '+ "Contact: "+response[i].number +'<br>\
                '+ "Email: "+response[i].email +' <br>\
                '+ "Message: "+response[i].message +' <br>\
                </p>\
                <button onclick = "DeleteContact(this.id)" class="InfomationDetailsCardDeleteBtn" id="'+response[i]._id+'">Delete</button>\
                </div>\
                ');
            }
        }
        $("#InfomationDetailsContainer").append('<button onclick="returnToForm()" id = "contact-return">Go Back</button>');
      });


      
}

function returnToForm(){
    $("#myForm").show();
    $("#InfomationDetails").hide();
}

function DeleteContact(objectId){
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://contactform-b9e0.restdb.io/rest/contact/"+objectId,
        "method": "DELETE",
        "headers": {
          "content-type": "application/json",
          "x-apikey": APIKEY,
          "cache-control": "no-cache"
        }
      }
      
      $.ajax(settings).done(function (response) {
        console.log(response);
      });
      $("#InfomationDetailsContainer").empty();
      getContactInfo(2)
}
