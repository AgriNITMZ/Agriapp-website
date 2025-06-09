const otpTemplate = (otp) => {
	return `<!DOCTYPE html>
    <html>
   
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PreciAgri - OTP Verification</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                background-color: #f9f9f9;
                font-family: 'Roboto', Arial, sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #333333;
                margin: 0;
                padding: 0;
            }
   
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 30px 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            }
            
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
   
            .logo-container {
                margin-bottom: 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 150px;
                height: auto;
            }
            
            .brand-name {
                font-size: 24px;
                font-weight: 700;
                margin-top: 10px;
            }
            
            .blue {
                color: #4A90E2;
            }
            
            .green {
                color: #4CAF50;
            }
   
            .message {
                font-size: 22px;
                font-weight: 700;
                color: #333;
                margin-bottom: 25px;
                text-align: center;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
   
            .body {
                font-size: 16px;
                margin-bottom: 25px;
                color: #555;
                padding: 0 10px;
            }
            
            .body p {
                margin-bottom: 15px;
            }
   
            .otp-container {
                margin: 30px auto;
                text-align: center;
            }
            
            .otp-code {
                display: inline-block;
                font-size: 30px;
                font-weight: 700;
                letter-spacing: 5px;
                color: #333;
                background-color: #f5f5f5;
                padding: 15px 30px;
                border-radius: 8px;
                border: 1px solid #e0e0e0;
            }
            
            .expiry-notice {
                font-size: 14px;
                color: #777;
                margin-top: 10px;
                text-align: center;
            }
            
            .divider {
                height: 1px;
                background-color: #eeeeee;
                margin: 25px 0;
            }
   
            .footer {
                text-align: center;
                font-size: 14px;
                color: #888888;
                margin-top: 30px;
            }
            
            .contact-info {
                margin-top: 20px;
            }
            
            .contact-info a {
                color: #4A90E2;
                text-decoration: none;
            }
            
            .social-icons {
                margin-top: 20px;
            }
            
            .social-icons a {
                display: inline-block;
                margin: 0 8px;
                color: #4A90E2;
                text-decoration: none;
            }
            
            /* Media Queries for Responsive Design */
            @media screen and (max-width: 480px) {
                .container {
                    padding: 20px 15px;
                }
                
                .message {
                    font-size: 20px;
                }
                
                .body {
                    font-size: 15px;
                }
                
                .otp-code {
                    font-size: 24px;
                    padding: 12px 20px;
                    letter-spacing: 3px;
                }
            }
        </style>
    </head>
   
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img class="logo" src="https://res.cloudinary.com/daon246ck/image/upload/c_thumb,w_200,g_face/v1742024476/app_icon_lcrihw.png" alt="PreciAgri Logo">
                    <div class="brand-name">
                        <span class="blue">Preci</span><span class="green">Agri</span>
                    </div>
                </div>
                <div class="message">Verify Your Email Address</div>
            </div>
            
            <div class="body">
                <p>Hello,</p>
                <p>Thank you for choosing PreciAgri. To complete your account verification, please use the following One-Time Password (OTP):</p>
                
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="expiry-notice">This code will expire in 5 minutes</div>
                </div>
                
                <p>If you didn't request this verification, please ignore this email or contact our support team if you have any concerns.</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
                <div class="contact-info">
                    Need help? Contact us at <a href="mailto:preciagri.mz@gmail.com">preciagri.mz@gmail.com</a>
                </div>
                
                <div class="social-icons">
                    <a href="#" target="_blank">Facebook</a> • 
                    <a href="#" target="_blank">Twitter</a> • 
                    <a href="#" target="_blank">Instagram</a>
                </div>
                
                <p style="margin-top: 20px;">© ${new Date().getFullYear()} PreciAgri. All rights reserved.</p>
            </div>
        </div>
    </body>
   
    </html>`;
};

module.exports = otpTemplate;