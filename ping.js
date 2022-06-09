const Monitor = require('ping-monitor');
const nodemailer = require('nodemailer');

const webserver = "10.0.0.2"
const local_PsExec = ".\\PSTools\\PsExec.exe"
const comando = "shutdown /r /d p:0:0"




//<----------------------------------------------------------------------------------------CONTADOR DE TIMEOUTS
let timeout = 0





//<-------------------------------------------------------------------------------------------HORA
 horaAtual = ()=> {

    var date = new Date();
    

 return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0")
}







//<------------------------------------------------------------------------------------------CONFIGURAÇÕES E-MAIL
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',                                                               //<---------------- login do e-mail
        pass: ''                                                                //<---------------- senha do e-mail
    }
});






const sendmail = (mailOptions) => {

    transporter.sendMail(mailOptions, function(error, info){

        if (error) {

            console.log(error);
            console.log()

        } else {

            console.log('Email enviado com sucesso!')

        }
    });


}





const resetWebServer =  () =>{

    const {spawn} = require ('child_process')

    const bat = spawn('cmd.exe',[
    
        '/c',
        `${local_PsExec} \\\\${webserver} -accepteula -i -u CRPRJ\\administrator -p *** cmd.exe /c `,
        `${comando}`
    
    ]);
    
    bat.stdout.on('data', (data) => {
    
        //console.log(data.toString());
    
    });
    
    bat.stderr.on('data', (data) => {
    
        //console.error(data.toString());
    
    });
        
    bat.on('exit', (code) => {
    
        //console.log(`Servidor resetado com sucesso! Aguarde...`);
    
    });
    
   
    console.log(`\nServidor resetado com sucesso! Aguarde...`);

}







const myMonitor = new Monitor({

    website: 'http://www.crprj.org.br/site/',                   //<---------------- site a ser monitorado
    title: 'CRPRJ',                                                 
    interval: 1,
    

    config: {

        intervalUnits: 'minutes', // seconds, milliseconds, minutes {default}, hours
       // intervalUnits: 'seconds', // seconds, milliseconds, minutes {default}, hours
        
        
    },

    httpOptions: {

        timeout: 30000      //<-----------------------------------------------------------------TEMPO DO TIMEOUT: 30 segundos

    }


    
});


 


console.log('Iniciando...')





myMonitor.on('up', function (res, state) {  //<------------------------------------------------------SITE ONLINE
    
    timeout = 0             //<------------------------------------------------------------------TIMEOUT VOLTA A ZERO
    
    let horaCerta = horaAtual()
    
    console.log(`[${horaCerta}] O site do ${myMonitor.title} está online.`);



});






myMonitor.on('timeout', function (error, res) {       //<-------------------------------------------------------SITE LENTO

    let horaCerta = horaAtual()

    console.log(`[${horaCerta}] O site do ${myMonitor.title} parece estar lento.`);

    timeout++                               //<------------------------------------------------------------------TIMEOUT INCREMENTADO

    if (timeout == 3){                      //<------------------------------------------------------------------TESTADOR DE TIMEOUT

        timeout = 0
        


        //<------------------------------------------------------------------------------------------------------ENVIO DE E-MAIL, CASO TENHA TIMEOUTS SEGUIDOS
        var mailOptions = {
            from: {
                name: 'Monitor do site',                                   
                address: ''
            },
        
            to: '',
            subject: 'Alerta de lentidão: O site parece estar lento',
            text: 'Segundo a aplicação monitora, o site ________ vem apresentando lentidão por pelo menos 10 minutos. Favor, verificar.'
        };
    
        //sendmail(mailOptions)

        //resetWebServer()





    }

});







myMonitor.on('down', function (res) {       //<--------------------------------------------------------SITE OFFLINE

    timeout = 0             //<--------------------------------------------------------------------TIMEOUT VOLTA A ZERO
    
    let horaCerta = horaAtual()

    console.log(`[${horaCerta}] O site do ${myMonitor.title} está fora do ar! ` + `[` + res.statusMessage + `]`)
    console.log(`------------------------------------------------------------------\n`);



        //<----------------------------------------------------------------------------------------------ENVIO DE E-MAIL, CASO OFFLINE
        
        
        /*
        var mailOptions = {
            from: {
                name: 'Monitor do site',
                address: ''
            },
        
            to: '',
            subject: 'Alerta: O site parece estar fora do ar',
            text: 'Segundo a aplicação monitora, estamos enfrentando algum problema no site . Favor, verificar.'
        };
    
        sendmail()
        */
        




});







/*
myMonitor.on('stop', function (website) {

    console.log(website + ' monitor has stopped.');

});





myMonitor.on('error', function (error) {

    console.log(error);

});
*/