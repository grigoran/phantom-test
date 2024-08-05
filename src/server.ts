import { fastifyStatic } from '@fastify/static';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify from 'fastify'
import path from 'path';
import crypto from 'crypto'
import bs58 from 'bs58'

const HOST_NAME = 'http://localhost:8080';

const fastify = Fastify({
    logger: true
}).withTypeProvider<TypeBoxTypeProvider>();


fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
});

/** html для определения приложения */
fastify.get('/', async (req, res) => {
    console.log(path.join(__dirname, 'public'));
    return res.sendFile('index.html');
});

/** Картинка для приложения */
fastify.get('/robot.png', async (request, reply) => {
    console.log(path.join(__dirname, 'public'));
    return reply.sendFile('robot.png');
});


/** Получить ссылку для оплаты */
fastify.get('/get-link', {
    schema: {
        querystring: Type.Object({
            user_id: Type.Integer({ minimum: 1 })
        }),
    }
}, async (req, res) => {
    // Ссылка для получения метаданных приложения
    const appUrl = encodeURIComponent('https://phantom.app');

    const keyPair = crypto.generateKeyPairSync('x25519');

    const pubKeyBuf = keyPair.publicKey.export({type: 'spki', format: 'der'});

    const pubKey = bs58.encode(pubKeyBuf);

    // Куда отправит phantom после подключения
    const redirectLink = encodeURIComponent(`${HOST_NAME}/send-transaction`);

    const generatedUrl = `https://phantom.app/ul/v1/connect?app_url=${appUrl}&dapp_encryption_public_key=${pubKey}&redirect_link=${redirectLink}`;

    return generatedUrl;
});

fastify.get('/send-transaction', {}, async (req, res)=> {});

fastify.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
});
