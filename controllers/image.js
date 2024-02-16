const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const express = require("express");
const cors = require("cors");
const app = express();
const stub = ClarifaiStub.grpc();

app.use(cors());

const handleApiCall = (req, res) => {
  const PAT = process.env.API_CLARIFAI;
  const USER_ID = "dmcdaniel9";
  const APP_ID = "smartbrain";
  const MODEL_ID = "face-detection";
  const IMAGE_URL = req.body.input;

  const metadata = new grpc.Metadata();
  metadata.set("authorization", "Key " + PAT);

  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      model_id: MODEL_ID,
      inputs: [
        { data: { image: { url: IMAGE_URL, allow_duplicate_url: true } } },
      ],
    },
    metadata,
    (err, response) => {
      if (err) {
        throw new Error(err);
      }

      const output = response.outputs[0].data.regions.map((region) => {
        return region.region_info.bounding_box;
      });

      res.json(output);
    },
  );
};

const handleImageSubmit = (req, res, db) => {
  const { id } = req.body;

  db("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then((entries) => {
      entries.length
        ? res.json(entries[0])
        : res.status(400).json("User not found");
    })
    .catch((err) => res.status(400).json("Unable to get entries"));
};

module.exports = {
  handleImageSubmit,
  handleApiCall,
};
