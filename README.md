# PRESO

An application that allows the use of a mobile phone to control a reveal.js presentation

##Features

* Navigate the slides with your phone
* Control HTML5 Video within the slides with your phone

##Demo

You can view a demo of the app [here](http://preso.jit.su/ "Here")


##Install

Installing is pretty simple and the app is quick to get off the ground  

You will need node and npm installed to use the app

You can get node and npm [here](http://nodejs.org "Here")

**Clone the repo**

	git clone https://github.com/ShaunBaker/preso.git 
	
**Install the apps dependencies**

	cd preso && npm install -d
	
If this fails, this is due to a dependency for node-canvas, so you will need to run with homebrew

	brew install cairo
	
**Start the app**

	node app.js
	
##Editing the slides

The slides are located in the /views/index.jade file

Each slide is contained within a HTML Section element

These are moved horizontally

To add vertical slides, you will need a HTML section containing subs sections for each vertical slide
