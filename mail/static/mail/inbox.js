document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').onsubmit = send_mail;

  // By default, load the inbox
  load_mailbox('inbox');

});

function send_mail() {

  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      //console.log(result);
      load_mailbox("sent");

    })
  return false

}


function show_mails(email, mailbox) {

  let recipient = document.createElement('div')
  if (mailbox === "inbox") {
    recipient.innerHTML = email.sender
  }

  document.querySelector('#emails-view').append(recipient)
}



function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function setArchive(mailId) {

  fetch(`/emails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  }).then(() => load_mailbox("inbox"));


}


function unArchive(mailId) {

  fetch(`/emails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  }).then(() => load_mailbox("archive"));


}



function setRead(mailId) {

  fetch(`/emails/${mailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  }).then();


}


function toReply(mail, replyBodyText) {
compose_email()
document.querySelector('#compose-recipients').value = mail[1].innerHTML;
document.querySelector('#compose-subject').value = "Re: " + mail[5].innerHTML;
document.querySelector('#compose-body').value = replyBodyText;



}



function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  if (mailbox == "inbox") {

    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {


          // Print emails

          let element = document.createElement('div');

          let elem = document.createElement('a');
          elem.style.border = '1px solid black'



          emails.forEach(email => {
            const text = `
 <li class="list-group-item d-flex justify-content-between align-items-center">

<span id="sender"> ${ email['sender']}   </span> 
<span id="subject">${ email['subject']}</span>
<span id="body">${ email['body']}</span>
<span id="body">${ email['timestamp']}</span>
<span class="d-none" id="body">${ email['id']}</span>
<span class="d-none" id="body">${ email['read']}</span>

<button class="btn btn-secondary" id="archive" > Archive </button>
<button class="btn btn-primary" id="view" > View</button>
<button class="btn btn-danger" id="reply" > Reply</button>


</li>

`;
            element.innerHTML += text
            //text.innerHTML = email['sender'] +  email['subject']+ email['body'] 
            //element.append(elem.innerHTML)
          });


          document.querySelector('#emails-view').append(element)

          let viewButton = document.querySelectorAll('#view')
          let replyButton = document.querySelectorAll('#reply')

          let archiveButton = document.querySelectorAll('#archive')

          var viewBracket = document.createElement('div');
          let viewEmail = document.querySelector('.viewEmail')


          let viewText;

          replyButton.forEach(button => {
            button.addEventListener('click', () => {
            console.log(button.parentElement.childNodes[5].innerHTML)  

            let replyBodyText = ` 
            ${ "On: " + button.parentElement.childNodes[7].innerHTML}  
            ${ button.parentElement.childNodes[1].innerHTML + "wrote: "}   
            ${button.parentElement.childNodes[5].innerHTML} 
             `

             toReply(button.parentElement.childNodes, replyBodyText)

          })

        })



          archiveButton.forEach(button => {
            if (button.parentElement.childNodes[9].innerHTML == "true") {
              button.parentElement.style.backgroundColor = "success"

            }

            button.addEventListener('click', () => {

              setArchive(button.parentElement.childNodes[9].innerHTML)
              console.log(button.parentElement.childNodes[9].innerHTML)

            })
          })



          viewButton.forEach(button => {

              if (button.parentElement.childNodes[11].innerHTML == "true") {
                button.parentElement.style.backgroundColor = "#DCDCDC"

              } else if (button.parentElement.childNodes[11].innerHTML == "false") {
                button.parentElement.style.backgroundColor = "white"

              }

              button.addEventListener('click', () => {

                viewText = ` 

    <h1 class="display-4" id="sender"> ${"Sender: " + button.parentElement.childNodes[1].innerHTML}   </h1> 
    <h1 class="display-4" id="subject">${ " Title: " + button.parentElement.childNodes[3].innerHTML}   </h1>
    <h1 class="display-4" id="subject">${ " Time: " + button.parentElement.childNodes[7].innerHTML}   </h1>
    <p id="body">${button.parentElement.childNodes[5].innerHTML} </p>
    <p class="d-none" id="body">${button.parentElement.childNodes[11].innerHTML} </p>

    <button id="back" class="btn btn-warning" id="view" > Back</button>


   `
                setRead(button.parentElement.childNodes[9].innerHTML)


                document.querySelector('#emails-view').style.display = 'none';

                viewEmail.innerHTML = viewText

                document.querySelector('#back').addEventListener('click', () => {
                  document.querySelector('#emails-view').style.display = 'block';
                  viewEmail.innerHTML = ""

                })


              })

            }



            


          )
        }

      )}



    else if (mailbox == "archive") {

      fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {

      console.log(emails)

      let element = document.createElement('div');

      emails.forEach(email => {

      const text = `
      <li class="list-group-item d-flex justify-content-between align-items-center">
     
     <span id="sender"> ${ email['sender']}   </span> 
     <span id="subject">${ email['subject']}</span>
     <span class="d-none" id="body">${ email['body']}</span>
     <span id="body">${ email['timestamp']}</span>
     <span class="d-none" id="body">${ email['id']}</span>
     <span class="d-none" id="body">${ email['read']}</span>
     <button class="btn btn-success" id="unarchive" > Unarchive </button>
     
     
     
     </li>
     
     `;

     element.innerHTML += text

      })

      document.querySelector('#emails-view').append(element)


      let unArchiveButton = document.querySelectorAll('#unarchive')

      unArchiveButton.forEach(button => {
      
        button.addEventListener('click', () => {
          unArchive(button.parentElement.childNodes[9].innerHTML)
          console.log(button.parentElement.childNodes[9].innerHTML)

        })
      })






    }
  
      )}



      else if (mailbox == "sent") {

        fetch('/emails/sent')
        .then(response => response.json())
        .then(emails => {
  
        console.log(emails)
  
        let element = document.createElement('div');
  
        emails.forEach(email => {
  
        const text = `
        <li class="list-group-item d-flex justify-content-between align-items-center">

        <span id="sender"> ${ email['recipients']}   </span> 
        <span id="subject">${ email['subject']}</span>
        <span class="d-none" id="body">${ email['body']}</span>
        <span id="body">${ email['timestamp']}</span>
        <span class="d-none" id="body">${ email['id']}</span>
        <span class="d-none" id="body">${ email['read']}</span> 
        <span class="d-none" id="body">${ email['recipients']}</span> 

        
        <button class="btn btn-primary" id="view" > View</button>
        
        
        </li>
       
       `;
  
       element.innerHTML += text
  
        })
  
        document.querySelector('#emails-view').append(element)
  
  
        let viewButton = document.querySelectorAll('#view')
        let archiveButton = document.querySelectorAll('#archive')

        var viewBracket = document.createElement('div');
        let viewEmail = document.querySelector('.viewEmail')


        let viewText;

    

  
        viewButton.forEach(button => {
   
          button.addEventListener('click', () => {

            viewText = ` 

<h1 class="display-4" id="sender"> ${"To: " + button.parentElement.childNodes[13].innerHTML}   </h1> 
<h1 class="display-4" id="subject">${ " Title: " + button.parentElement.childNodes[3].innerHTML}   </h1>
<h1 class="display-4" id="subject">${ " Time: " + button.parentElement.childNodes[7].innerHTML}   </h1>
<p id="body">${button.parentElement.childNodes[5].innerHTML} </p>

<button id="back" class="btn btn-warning" id="view" > Back</button>
`
            console.log(button.parentElement.childNodes[13].innerHTML)
            console.log("Sent--> View")
            setRead(button.parentElement.childNodes[9].innerHTML)


            document.querySelector('#emails-view').style.display = 'none';

            viewEmail.innerHTML = viewText

            document.querySelector('#back').addEventListener('click', () => {
              document.querySelector('#emails-view').style.display = 'block';
              viewEmail.innerHTML = ""

            })


          })

        })
      





        }

    

        )}



}