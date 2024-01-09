const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

PORT = 3000;

  //for creating folder
 app.post('/createFile', (req, res) => {

  const folderPath = './current date-time';
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }


  const timestamp = new Date().toISOString();
  const fileName = `${timestamp.replace(/:/g,'-')}.txt`;
  const filePath = path.join(folderPath,fileName);

  fs.writeFile(filePath, timestamp, (err) => {

    if(err){
      console.log(err);
      return res.status(404).json({json : 'Error Creating File'})
    }
      console.log(`File created ${fileName}`);
      res.json({message : 'file created successfully.'});

  })
  
})

 // for retrieve file

 app.get('/getAllFiles', (req, res) => {
  const folderPath = './current date-time';
  fs.readdir(folderPath, (err, files) => {
    if(err){
      console.log(err);
      return res.status(404).json({error : 'Error reading Files'})
    }
    res.json({files});
  })
})

app.listen(PORT , () =>{
  console.log(`Server runs at http://localhost:${PORT}`)
})