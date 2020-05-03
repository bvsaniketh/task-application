const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bvsaniketh95@gmail.com',
        subject: 'Thanks for joining in!',
        // text is a template string
        text: `Welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'bvsaniketh95@gmail.com',
        subject: 'Sorry that you have cancelled out from our application',
        text: `We will be seeing you soon ${name}!`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}