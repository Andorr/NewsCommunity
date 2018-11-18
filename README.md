# NewsCommunity - A Node Express REST API App
This is a simple Node Express Rest API for a basic Newspage. It consists of 
the basic implementation of the MVC concept with News-posts, comments, upvoting and users.

It uses MongoDB as database and mongoose to communicate

## Contents
[Installation](#installation)  
[Endpoints](#Endpoints)

## Installation

### Getting Started

```
git clone git@github.com:Andorr/NewsCommunity.git
cd NewsCommunity
npm install
npm start
```

### Custom configuration

#### Database
To configure your own MongoDB with this project you have to change the __.env__ file.

```
MONGODB_DATABASE_URL=YOUR_DATABASE_URL_HERE
MONGODB_TEST_DATABASE_URL=YOUR_TEST_DATABASE_URL_HERE
```

#### Image upload
The API has a solution for handling uploading of images to a server. By default this is a
S3 hosted by [DigitalOcean](https://www.digitalocean.com/), and Digital Ocean required AWS keys.
To get this to work you have to define your own Digital Ocean S3 Space with AWS-keys.

In the __.env__:

```
IMAGE_ENDPOINT=ams3.digitaloceanspaces.com
S3_BUCKET=YOUR_DIGITAL_OCEAN_SPACE_NAME

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
```


### Endpoints

The API endpoints can be split into following sections: __News__ and __Users__:

#### News
* __/news__ **GET**
Gets all latests news with a limit of 20.
  ##### Optional params
  * page: The pagination value, a number between 0 and X
  * category: Gives news-posts based on a given category. For example "IT", "politics", "entertainment", "other"...etc
  * importance: Gives news-posts with the given importance. It is a number [1-2].
  * user: Gives the news-posts posted by a given user. Needs to be authenticated to access this option.
  
