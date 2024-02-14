require("dotenv").config();
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
const express = require("express");
const cors = require("cors");

const app = express();
const stub = ClarifaiStub.grpc();

app.use(cors());

const handleApiCall = (req, res) => {
  // Your PAT (Personal Access Token) can be found in the portal under Authentification
  const PAT = process.env.API_CLARIFAI;

  // Specify the correct user_id/app_id pairings
  // Since you're making inferences outside your app's scope
  const USER_ID = 'dmcdaniel9';
  const APP_ID = 'smartbrain';
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = 'face-detection';
  const IMAGE_URL = req.body.input;

  const metadata = new grpc.Metadata();
  metadata.set("authorization", "Key " + PAT);

  stub.PostModelOutputs(
    {
      user_app_id: {
        "user_id": USER_ID,
        "app_id": APP_ID
      },
      model_id: MODEL_ID,
      inputs: [
        { data: { image: { url: IMAGE_URL, allow_duplicate_url: true } } }
      ]
    },
    metadata,
    (err, response) => {
      if (err) {
        throw new Error(err);
      }
      // Since we have one input, one output will exist here
      const output = response.outputs[0].data.regions[0].region_info.bounding_box;
      res.json(output);
    }
  );
}

const handleImageSubmit = (req, res, db) => {  
  const { id } = req.body;

  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      if (entries.length) {
        res.json({ entries: entries[0].entries});
      } else {
        res.status(400).json('User not found');
      }
    })
    .catch(err => res.status(400).json('Unable to get entries'));
}



module.exports = {
  handleImageSubmit,
  handleApiCall
}