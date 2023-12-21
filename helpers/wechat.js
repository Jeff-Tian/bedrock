module.exports = {
  getFromUserName: (xml) => {
    return xml.elements[0].elements[1].elements[0].cdata;
  },
  getToUserName: (xml) => {
    return xml.elements[0].elements[0].elements[0].cdata;
  },
  getContent: (xml) => {
    return xml.elements[0].elements[4].elements[0].cdata;
  }
}
