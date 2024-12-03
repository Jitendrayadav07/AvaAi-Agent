const axios = require('axios');
const areanPostController = async (req, res) => {
    console.log(req.body)
    const thirdPartyUrl = 'https://api.stararena.com/threads'; // Replace with the actual URL
    const dataToSend = req.body; // Data received in the request body

    const headers = {

            'Content-Type': 'application/json',
            'Authorization': 'Bearer' + " eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMDUzZjc2MWUtNzhmNS00MTk0LWJmZGYtOGMwMGUyOGE1Yzc1IiwidHdpdHRlcklkIjoiMTc2OTY4NDA3MDQzMzE3NzYwMCIsInR3aXR0ZXJIYW5kbGUiOiJNZW1lRGVhZHBvb2wiLCJ0d2l0dGVyTmFtZSI6IkRlYWRwb29sIE1lbWUgTG9yZCIsInR3aXR0ZXJQaWN0dXJlIjoiaHR0cHM6Ly9zdGF0aWMuc3RhcnNhcmVuYS5jb20vdXBsb2Fkcy85N2YwY2NmMy1iNWRiLWI1OTAtM2Q3Ni1lM2YxYTNlZjk5ODMxNzI5NDg0NzAxMjQyLnBuZyIsImFkZHJlc3MiOiIweDE3ZWI0ZGYwM2FjMWRkOGY2YzdhNzk0ZjgxMTgxYTkwYzYyZGFiNjYifSwiaWF0IjoxNzMxNjY5MTU0LCJleHAiOjE3NDAzMDkxNTR9.l6pGIXNUD4F_YToul2IbMKtWuS2amHVfpt1rjMSlBqHa914U5aLv4rMGf1aiDYoRSSCvrU7HCaqcAD7LGMmiNmMf2IusukLv4AjasAMg97PwfYC2qGF5eZOJTMld_45Aiv73QCP8j2qe6lUcGh1AsiaAiL3TuSieMY3TIrLepKofscdL78ioKU2RKvjqjU8Lytf_TsI6GmtwVpM8_UF7TE0-y9GtivIuqUZDWYWMSDGyfJ6P4xmM8PpN3-mYAFfoaF6y__ppPkHHRp8zz6Dj8KdkMYkgGHzZFNf-hXShBHBLfY6Zw8mXzTV-wogDlnX1f5q6Wdb8o40gHrzxla44IB0Qjus1Q5fZI4wdEkfi2F2YqgooLwONQm8SzZq0aLU73WX8R_ou6jRCDEXWHPmNohN8mIAHZc0KwG7mQF8GAQtp_MBlBEX6L8siWmxAccSG2hSzxRNsaM-omg30WE446b7P20y8pin7GwTLgv1z3t8KEJYmOTxBdGd_mj38WKCPnQ2pgmB_TeLAAoMAf2ZgE5q_MMFBZQI4dcvnUnrDPq8IUjVyJmwhhW0GsPfGNyM3pnfaNywuZOLm9yL_V0LZ9JKgPyWQLoh4LwwXvsJuu-IznQwTH1HHXthr4-tkwbVqjZa1m-Y85HcXCwOhN08x24xZfBfwam8P1ZTtQ1voXDc",
            'Accept': 'application/json'

    }
    try {
        const response = await axios.post(thirdPartyUrl, dataToSend, {headers});
        res.status(200).json({
            message: 'Data sent successfully!',
            thirdPartyResponse: response.data,
        });
    } catch (error) {
        console.error('Error sending data to third-party URL:', error);
        res.status(500).json({
            message: 'Failed to send data to the third-party URL.',
            error: error.message,
        });
    }
}

module.exports = {
    areanPostController
};