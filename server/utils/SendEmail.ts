import transporter from "../config/nodemailer";

const sendEmail = async (to : string, subject : string, html : string, text : string) => {
    try {
        const info = await transporter.sendMail({
            from : process.env.EMAIL_USERNAME,
            to,
            subject,
            html,
            text
        })

        // console.log(info);
    }
    catch (error) {
        console.log(error);
    }
}

export default sendEmail;