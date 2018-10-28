const News = require('./api/models/news');

const method = async () => {
    await News.deleteMany({author: null})
    .then((result) => {
        console.log("SUccess" ,result);
    })
    .catch(err => console.log(err));

    console.log("done");
}