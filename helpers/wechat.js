const wechatMessageHelper = {
    getFromUserName: (xml) => {
        return xml.elements[0].elements[1].elements[0].cdata;
    },
    getToUserName: (xml) => {
        return xml.elements[0].elements[0].elements[0].cdata;
    },
    getContent: (xml) => {
        const type = wechatMessageHelper.getMessageType(xml);
        if (type === 'text') {
            return xml.elements[0].elements[4].elements[0].cdata;
        } else if (type === 'voice') {
            return wechatMessageHelper.getRecognition(xml);
        }

        return xml.elements[0].elements[4].elements[0].cdata;
    },
    getMessageId: (xml) => {
        return xml.elements[0].elements.filter(e => e.name === 'MsgId')[0].elements[0].text;
    },
    getRecognition: (xml) => {
        const recognitionElement = xml.elements[0].elements.filter(e => e.name === 'Recognition');
        return recognitionElement ? recognitionElement[0].elements[0].cdata : '';
    },
    getMessageType: (xml) => {
        return xml.elements[0].elements.filter(e => e.name === 'MsgType')[0].elements[0].cdata;
    }
}

module.exports = wechatMessageHelper;
