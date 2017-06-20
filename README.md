This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myTabs tabs
```

Then, to run it, cd into `myTabs` and run:

```bash
$ ionic cordova platform add ios
$ ionic cordova run ios
```

Substitute ios for android if not on a Mac.

## Some notes on my fork of the repo 

There are three steps:
### 1.Get the repo 
1. Clone from https://github.com/allmaennitta/circles_testnet.git  
If you want to use Docker for installation, clone it into a folder available for Docker.
2. Find somebody to provide you with the values of envionments/environment.ts
 
### 2.Base installation
This step is about to get your basic installation of 
* Ant 1.9.6
* Maven 3.3.9
* Java 1.8.0_111
* Gradle 2.10 (Groovy 2.4.5)
* Android SDK 24.4.1 with  
APIs: android-10,android-15,android-16,android-17,android-18,android-19,android-20,android-21,android-22,
android-23,android-24,android-25  
Build-Tools: 25.0.2
* NodeJs 6.10.0 (I had some issues with 8.1.2)
* Cordova 7.0.1
* Ionic 2.2.1

#### a) On native Linux
Please install these packages by using the usual procedure for your distribution.  
Last step is most probable
```bash
$ sudo npm install -g ionic cordova
```
Please do NOT  create a starter project with `ionic start`. Necessary files are built or provided by the repo.

#### b) Via Docker Compose
1. Get Docker and Docker-Compose running on your OS.
2. Get via terminal in the docker-folder (/docker) of this repo (important!)
3. Execute there `docker-compose build`
4. Correct the path of the external volume to your Docker- and OS-needs
```yaml
  volumes:
#    - <path on your host with the git-repository, accessible by Docker>:/var/app
     - c:/Users/ingo/Development/nodejs/circles_testnet:/var/app
```
5. Execute there `docker-compose build`
6. As soon as the container is attached and running, open a second console and execute `docker-compose exec io bash`.
7. Have a look if everything is fine, e.g. by executing `ionic info` or by having a look if you can find the contents 
of your local folder in /var/app as you should, if the volumes are linked correctly.

### 3. Automated build steps 
1. `npm install`
2. `npm rebuild node-sass` may be necessary
3. `gulp`
4. Start the web-server for development mode by `ionic serve -s -b -p 8000.` If you use Docker you can do the
latter by activating the line `command: ionic serve -s -b -p 8000` in the yml-file.
