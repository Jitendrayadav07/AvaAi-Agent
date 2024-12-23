const axios = require('axios');
const ARENA_POST_CONSTANTS = require("../constants/arenaPostConstant");
require('dotenv').config();
const db = require("../config/db.config");
const FormData = require('form-data');
const fs = require('fs');
const {QueryTypes} = require("sequelize");
const Response = require("../classes/Response");

const areanPostController = async (req, res) => {
    const thirdPartyUrl = 'https://api.starsarena.com/threads'; // Replace with the actual URL
    const dataToSend = req.body; // Data received in the request body


    let scoreNumber = await db.sequelize.query(`SELECT * FROM tbl_arena_images WHERE number = ${dataToSend.score}`, { type: QueryTypes.SELECT });

    dataToSend.files[0].url = scoreNumber[0].url
    dataToSend.files[0].previewUrl = scoreNumber[0].arena_url

    const headers = {

        'Content-Type': 'application/json',
        'Authorization': 'Bearer' + " eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNmZmZDhkY2QtNDQ3Ni00Mjk5LWJjYzctMDkyZTgzNWYwNTE4IiwidHdpdHRlcklkIjoiMTg1OTEzMjQ0MjQxOTkwMDQxNyIsInR3aXR0ZXJIYW5kbGUiOiJBcmVuYUdyZWVkIiwidHdpdHRlck5hbWUiOiJBcmVuYSBGZWFyIGFuZCBHcmVlZCBJbmRleCIsInR3aXR0ZXJQaWN0dXJlIjoiaHR0cHM6Ly9zdGF0aWMuc3RhcnNhcmVuYS5jb20vdXBsb2Fkcy84NDgzMGZiMi1hNzM3LWM1MTUtZGU1YS1kODkzZTk5MzkwM2IxNzMyMDk0ODM2NjgwLnBuZyIsImFkZHJlc3MiOiIweDQwZDViNTg5ZmNmZGExY2NmODIzNTU0YjBkOGE1ZWZhYjNkNmZlZTAifSwiaWF0IjoxNzMyMDk0ODM2LCJleHAiOjE3NDA3MzQ4MzZ9.kOO5g61FzC-uIUKuF7tyoYHJpiDo1VUIHZwQW38Lkfsq5rEhmqzrZ5TqBfhRcoxH3TKcVIenZKFdN1dFOxpM1OunKwsk0xf18WqHoRtqS6A-64qoZMKCu1_1l0oJK7nyx_ArgimgeFa0Xr8QbdigkW7IkzGfM5oUe8A0mD3idEqYKwtWP9h1GOdijfVfqDkQvmXnbN-3mpUlcTifVd0IAAKr0p6K4vAVf3gWc1FzjMBsf6vZa4zugfjcd7iLxj2-vxt2DX0yG9LfxjxlOwh_8Y-mNO0FMZ2yyXu2diAAuQ8nLozreXlr_6lR8Y39lT36do6nRIRQ7gPms8FBx5mPyiHMhk2OYMtpO6X76Dim4REBGnUHepit0nJHPfF21ukW-4W4RQXZ2fVOqT1QXhbRy9mJH49hO3lXUMPJ8c3-C29D8uDVkBwo3q3zn_JNhcRhxu2cBLm0iXkRu4TeCN7j4RjZD4GOLmYOYIsZaySTTOKlHgB7PVwx1XkqK-BmKHoR-zJUeQPi-6Gssuf9q6BvCif7mUZPa2nCNfPe-r-OrmsH8qf0Sq8biVe6oAYrwNok3bTRoPxc8TFAreq6b7Qy4niY8-uQ4EwPmagfJA_j3RWLp2FKJwf_aKssIP7F2CV7dzvkXhLRvVME3QIPpWFwA2y5clAxR4ZCsSw-_XMx3Hg",
        'Accept': 'application/json'

    }
    try {
        const response = await axios.post(thirdPartyUrl, dataToSend, { headers });
        res.status(200).json(Response.sendResponse(true, response.data, ARENA_POST_CONSTANTS.DATA_SENT_SUCCESSFULLY, 200));
    } catch (error) {
        console.error('Error sending data to third-party URL:', error);
        res.status(500).json(Response.sendResponse(false, null, ARENA_POST_CONSTANTS.FAILED_TO_SEND_DATA, 500));
    }
}

const uploadController = async (req, res) => {
    const filePath = `./uploads/${req.file.filename}`;
    const fileStream = fs.createReadStream(filePath);

    const get_url = "https://api.starsarena.com/uploads/getUploadPolicy?fileType=image/png&fileName=testss.png"

    let get_res = await axios.get(get_url, {
        headers: {
            "authentication": "Bearer " + "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMzBlZWNjM2YtODZiZi00MjgzLTgwMzktODFlYjMzNDMxZmM2IiwidHdpdHRlcklkIjoiMTcxMTY4OTQyOTcwMDUzNDI3MiIsInR3aXR0ZXJIYW5kbGUiOiJ3ZWIzX25rIiwidHdpdHRlck5hbWUiOiJOZWVsIEthbmFuaSDwn5S6IiwidHdpdHRlclBpY3R1cmUiOiJodHRwczovL3N0YXRpYy5zdGFyc2FyZW5hLmNvbS91cGxvYWRzLzc2YWY5M2ZjLWEwZDEtNDg2Mi1iZDFlLWE0ODg0MjM3MGJiNjE3MzEwNDkyOTEzMjMucG5nIiwiYWRkcmVzcyI6IjB4NGJhNjhkMDFlNzkxMzZkZDc2OGRmNmE3MTY2ZmJlYjkwM2FiMmY2OSJ9LCJpYXQiOjE3MzM5MDk2NTYsImV4cCI6MTc0MjU0OTY1Nn0.RHMD7ijHAAgPyuMN8jsjugE3u8pO4ikMGBP-ghDQY1gqpqD9NNpt1XtMxXkvYz-Uh_Om0RxTz07M-xj6OVdWZLrRXCXsCQssM962iHeA0AM4HoSjFFeNDOZ4IXduwF3Kyo69UVHdeIus-h4ekrN9fUKAt9Vil1BNqWF1qxxkbdEtCUlAfOQkavjEiq7UNNlwpnoKvk-AOp6-z9aeX811g6WYgDgUPM5hW22-7XiP7LE_07JN8FfTjYq5_XdXQL8igUmBRves4dwTPjkhVqeeIOsqJXiL6k71Hs4_LphDjE4Xw93lrfxiHAhTbSZuRkIxZ7ilScX0gOlrrQROx_-kJAvEGAp6XR7CSFxu5_ue3hef47KCAOcgpErjeUEq3XIpL0uvhTekS8_7dmaf5KrA2mEv7iASiCk0ZrZZFkyYgt371n9qubclPyfyZOGkShepzdihziITLJ8GmOO70GnG_MWiC2-GI2lrZ7YDUrImPuioQiVjjIex0HsRpTQOZSFhx3-GrmMwxpT4Dd1_LXR3PBriOiwRO3wFXPINGBccWQZtjM2YhwZUSnTMl0RmimVcNOBEaWVrikteBOYXBJ5ByJ-juRRcob7JKGG7xhJlkzdj-rdWmxZZcr5mmZW_owzMxJgGQgmChGpC1NNe0cuEHkdnBIJWA-RGKMsf1WtW2vw"
        }
    });

    const url = "https://storage.googleapis.com/starsarena-s3-01/";
    const arena_url = "https://static.starsarena.com/";
    const fields = {
        "key": get_res.data.uploadPolicy.key,
        "x-goog-date": get_res.data.uploadPolicy['x-goog-date'],
        "x-goog-credential": get_res.data.uploadPolicy['x-goog-credential'],
        "x-goog-algorithm": get_res.data.uploadPolicy['x-goog-algorithm'],
        "policy": get_res.data.uploadPolicy.policy,
        "x-goog-signature": get_res.data.uploadPolicy['x-goog-signature'],
        "content-type": req.file.mimetype
    }
    try {
        const formData = new FormData();

        for (const key in fields) {
            formData.append(key, fields[key]);
        }

        formData.append("file", fileStream);
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                "authentication": "Bearer " + "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMzBlZWNjM2YtODZiZi00MjgzLTgwMzktODFlYjMzNDMxZmM2IiwidHdpdHRlcklkIjoiMTcxMTY4OTQyOTcwMDUzNDI3MiIsInR3aXR0ZXJIYW5kbGUiOiJ3ZWIzX25rIiwidHdpdHRlck5hbWUiOiJOZWVsIEthbmFuaSDwn5S6IiwidHdpdHRlclBpY3R1cmUiOiJodHRwczovL3N0YXRpYy5zdGFyc2FyZW5hLmNvbS91cGxvYWRzLzc2YWY5M2ZjLWEwZDEtNDg2Mi1iZDFlLWE0ODg0MjM3MGJiNjE3MzEwNDkyOTEzMjMucG5nIiwiYWRkcmVzcyI6IjB4NGJhNjhkMDFlNzkxMzZkZDc2OGRmNmE3MTY2ZmJlYjkwM2FiMmY2OSJ9LCJpYXQiOjE3MzM5MDk2NTYsImV4cCI6MTc0MjU0OTY1Nn0.RHMD7ijHAAgPyuMN8jsjugE3u8pO4ikMGBP-ghDQY1gqpqD9NNpt1XtMxXkvYz-Uh_Om0RxTz07M-xj6OVdWZLrRXCXsCQssM962iHeA0AM4HoSjFFeNDOZ4IXduwF3Kyo69UVHdeIus-h4ekrN9fUKAt9Vil1BNqWF1qxxkbdEtCUlAfOQkavjEiq7UNNlwpnoKvk-AOp6-z9aeX811g6WYgDgUPM5hW22-7XiP7LE_07JN8FfTjYq5_XdXQL8igUmBRves4dwTPjkhVqeeIOsqJXiL6k71Hs4_LphDjE4Xw93lrfxiHAhTbSZuRkIxZ7ilScX0gOlrrQROx_-kJAvEGAp6XR7CSFxu5_ue3hef47KCAOcgpErjeUEq3XIpL0uvhTekS8_7dmaf5KrA2mEv7iASiCk0ZrZZFkyYgt371n9qubclPyfyZOGkShepzdihziITLJ8GmOO70GnG_MWiC2-GI2lrZ7YDUrImPuioQiVjjIex0HsRpTQOZSFhx3-GrmMwxpT4Dd1_LXR3PBriOiwRO3wFXPINGBccWQZtjM2YhwZUSnTMl0RmimVcNOBEaWVrikteBOYXBJ5ByJ-juRRcob7JKGG7xhJlkzdj-rdWmxZZcr5mmZW_owzMxJgGQgmChGpC1NNe0cuEHkdnBIJWA-RGKMsf1WtW2vw"
            },
        });
        console.log("res ===== >", response)
        if (+response.status === 204) {
            await db.tbl_arena_image.create({
                url: url + fields['key'],
                arena_url: arena_url + fields['key'],
                number: req.body.number
            });
            res.send("Upload successful!", 200);
        } else {
            res.status(response.status).send("Upload failed!");
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json(Response.sendResponse(false, null, "An error occurred during the upload.", 500));
    }
};

const getArenaPostController = async (req, res) => {
    try{
        const arena_images = await db.tbl_arena_post.findAll();
        res.status(200).json(arena_images);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    areanPostController,
    uploadController,
    getArenaPostController
};