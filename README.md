# NewsCommunity - A Node Express REST API App
This is a simple Node Express Rest API for a basic Newspage. It consists of 
a basic implementation of the MVC concept with a MongoDB database.

The API provides following functionality:
* __News-Posts__: Endpoints for creating, deleting, and editing news-posts.
* __User-system__: Endpoints for creating and deleting, in addition, an authentication-endpoint.
* __WebSocket__: The possibility to connect to a websocket to get a live update on changes and creation of news-posts.


## Contents
[Demo](#demo)  
[Installation](#installation)  
[Endpoints](#Endpoints)

## Demo
* Demostration of the API: [http://sys-ut-news-api.herokuapp.com/](http://sys-ut-news-api.herokuapp.com/)
* Frontend using the API: [http://sys-ut-news-app.herokuapp.com/](http://sys-ut-news-app.herokuapp.com/)

## Installation

### Getting Started

```
git clone git@github.com:Andorr/NewsCommunity.git
cd NewsCommunity
npm install
npm start
```

The user-system requires a JWT_KEY for the token-generation to work, and therefore requires a random JWT_KEY in .env:

```
JWT_KEY= WRITE_A_RANDOM_LONG_STRING_HERE
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
S3-server hosted by [DigitalOcean](https://www.digitalocean.com/), which requires AWS keys.
To get this to work you have to define your own Digital Ocean S3 Space with AWS-keys.

In the __.env__:

```
IMAGE_ENDPOINT=ams3.digitaloceanspaces.com
S3_BUCKET=YOUR_DIGITAL_OCEAN_SPACE_NAME

AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
```



## Endpoints

The API endpoints can be split into following sections: __News__ and __Users__:


### News
* __/news__ **GET**
Gets all latests news with a limit of 20.
  ##### Optional params
  * page: The pagination value, a number between 0 and X
  * category: Gives news-posts based on a given category. For example "IT", "politics", "entertainment", "other"...etc
  * importance: Gives news-posts with the given importance. It is a number [1-2].
  * user: Gives the news-posts posted by a given user. Needs to be authenticated to access this option.

* __/news__ POST**
Creates a new news-post. REQUIRES AUTH!
  ##### Requires following parameters in body:
  * title: string
  * subtitle: string
  * image: File
    * image_link: string. Instead of uploading a image-file, an image-link can be provided.
  * content: string
  * category: string. Is an enum of following values: 'sport', 'culture', 'entertainment', 'politics', 'IT', 'other'.
  * importance: number. The importance of a news-post


* __/news/:id__ **GET**
Returns the data of a given news-post


* __/news/:id__ **DELETE** 
Deletes a newspost. REQUIRES AUTH!


* __/news/:id__ **PUT**
Updates a given newspost. REQUIRES AUTH!


* __/news/comment__ **POST**
Creates a comment to a given post. REQUIRES AUTH!
  ###### Requires following parameters in body:
  * news: NEWS_ID
  * comment: string


* __/news/comment/:id__ **PUT**
Edits a given comment. Must provide a __news__ attribute-id in body. REQURIES AUTH!


* __/news/comment/:id__ **DELETE**
Deletes a given comment. Must provide a __news__ attribute-id in body. REQURIES AUTH!


* __/news/vote__  **POST**
Toggles the vote of the user on a given post. REQUIRES AUTH!


* __/news/category__ **GET**
Gets all the categories in form of an array


### Users

* __/account/signup__ **POST**
Creates a new user.
  ###### Following parameters in body is required:
  * email: string
  * password: string
  * nickname: string
  
* __/account/login__ **POST**
Returns a token.
  ##### Following parameters in required in body
  * email: string
  * password: string
  
* __/account__ **DELETE**
Deletes an user. REQUIRES AUTH

* __/account/avatar__  **POST**
Changes the user's profile image (avatar). REQURES AUTH!
  ##### Following parameters in required in body
  * image: FILE

* __/account/__ **GET**
Gets the user's user information, like email, nickname, and avatar. REQUIRES AUTH!
