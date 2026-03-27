// CLI: npm install nodemailer --save
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

let transporter = null;

// Only create transporter if email credentials are configured
if (MyConstants.EMAIL_USER && MyConstants.EMAIL_PASS &&
    MyConstants.EMAIL_USER !== 'your_email@outlook.com' &&
    MyConstants.EMAIL_PASS !== 'your_email_password') {
    transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: MyConstants.EMAIL_USER,
            pass: MyConstants.EMAIL_PASS
        }
    });
} else {
    console.warn('WARNING: Email credentials not configured. Email sending is disabled.');
}

const EmailUtil = {
    send(email, id, token) {
        const text = 'Thanks for signing up, please input these informations to activate your account:\n\t.id: ' + id + '\n\t.token: ' + token;

        return new Promise(function (resolve, reject) {
            if (!transporter) {
                console.warn('Email not sent (simulated): credentials not configured. Would send to:', email);
                resolve(true);
                return;
            }

            const mailOptions = {
                from: MyConstants.EMAIL_USER,
                to: email,
                subject: 'Signup | Verification',
                text: text
            };

            transporter.sendMail(mailOptions, function (err, result) {
                if (err) {
                    console.error('Email send error:', err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
};

module.exports = EmailUtil;
