/* ================================================================
   PROMISE — config.js
   TODAS as personalizações ficam aqui. Edite só este arquivo.
   ================================================================ */

window.CONFIG = {

    /* ---- WhatsApp ----
       Seu número com DDI + DDD, só dígitos. Ex: '5511987654321'
       Deixe vazio ('') para esconder os botões de responder. */
    WHATSAPP_NUMERO: '5532991685954',
    WHATSAPP_MENSAGEM: 'Acabei de ler a sua carta... ❤',

    /* ---- Pergunta secreta (trava de entrada) ----
       Só ela sabe a resposta. A comparação ignora maiúsculas e acentos,
       e aceita se a resposta digitada CONTIVER qualquer uma das
       variações abaixo (ex: "no shopping", "fomos no shoping"...).
       Deixe a lista vazia ([]) para DESATIVAR a trava. */
    PERGUNTA_SECRETA: {
        pergunta: 'Onde foi o nosso primeiro encontro?',
        respostas: ['shopping', 'shoping', 'shoppin', 'shopin',
                    'chopping', 'choping', 'xopping', 'xoping'],
        erroMensagem: 'Hmm... tem certeza que é você, Princesa? 😏 Tenta de novo.'
    }
};
