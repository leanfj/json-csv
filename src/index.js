'use strict';
const ObjectsToCsv = require('objects-to-csv-delimited');

const { join } = require('path')
const fs = require('fs');

(async () => {

    const files = []

    const normalizedPath = join(__dirname, '..', 'data')

    fs.readdirSync(normalizedPath).forEach((file) => {
        let nameAccount = file.slice(0, 4)
        files.push({ json: require(`../data/${file}`), name: nameAccount })
    })


    files.forEach(async (file) => {
        const data = []

        if (!file.json.dataArrays[0]) {
            return
        }

        const descriminacaoOperacao = file.json.dataArrays[0]['discriminacao_operacao']
        const mesReferencia = file.json.dataKeysValues['mes_referencia']
        const codigoInstalacao = file.json.dataKeysValues['codigo_instalacao']


        const realParseFloat = (s) => {
            if (typeof s === 'string') {
                s = s.replace(/[^\d,.-]/g, '')
                if (/^-?(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d+)?$/.test(s)) {
                    s = s.replace(/\./g, '')
                    s = s.replace(/,/g, '.')
                    return parseFloat(s)
                } else {
                    s = s.replace(/,/g, '')
                    return parseFloat(s)
                }
            }
            return parseFloat(s)
        }

        for (const key in descriminacaoOperacao) {
            if (Object.hasOwnProperty.call(descriminacaoOperacao, key)) {

                const element = {}
                for (const key2 in descriminacaoOperacao[key]) {
                    if (Object.hasOwnProperty.call(descriminacaoOperacao[key], key2)) {
                        // console.log(key2, descriminacaoOperacao[key][key2])
                        // console.log(key2)
                        switch (key2) {
                            case 'quantidade_registrada':
                            case 'quantidade_faturada':
                            case 'tarifa_impostos':
                            case 'valor':
                            case 'base_calculo_icms':
                            case 'aliquota_icms':
                            case 'icms':
                            case 'base_calculo_pis_cofins':
                            case 'pis':
                            case 'cofins':
                                if (typeof descriminacaoOperacao[key][key2] === 'string') {
                                    if (descriminacaoOperacao[key][key2].lastIndexOf('-') !== -1) {
                                        let semponto = descriminacaoOperacao[key][key2].replace(/\./g, '')
                                        let negativo = semponto.slice(-1)
                                        semponto = negativo + semponto.slice(0, -1)
                                        element[key2] = realParseFloat(semponto)
                                        // console.log(element[key2])
                                    } else {
                                        element[key2] = realParseFloat(descriminacaoOperacao[key][key2])
                                    }

                                    
                                } else {
                                    element[key2] = realParseFloat(descriminacaoOperacao[key][key2])

                                }
                                
                                // console.log(typeof descriminacaoOperacao[key][key2])
                                break;

                            default:
                                element[key2] = descriminacaoOperacao[key][key2]
                                break;
                        }
                        // if(typeof descriminacaoOperacao[key][key2] === "string"){
                        //     element[key2] = descriminacaoOperacao[key][key2].replace(//g, '.')
                        // } else {
                        // } 

                    }
                    // const element = descriminacaoOperacao[key];
                }

                element['nome_arquivo'] = `${file.name}${mesReferencia}`
                element['seu_codigo'] = codigoInstalacao

                data.push(element)
            }
        }

        // console.log(data)

        const csv = new ObjectsToCsv(data, {delimiter: ';'});
        await csv.toDisk(`./result/${file.name}${mesReferencia}.csv`, {headers: false});
    })

})();