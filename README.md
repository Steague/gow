# Galleries Project

## Docker development

This project is developed and built with Docker in the forefront.

### `docker build --build-arg NPM_TOKEN=<Font Awesome 5 Pro NPM Auth Token> .`

You can get the NPM Auth Token for Font Awesome 5 Pro [here](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers).

Take not of the image ID created (You can also view the ID by typing `docker images`) as you will need it in the next step.

### `docker run -it -p 3000:3000 -v <local project root directory>/src:/www/src <docker image>`

In place of `<local project root directory>` type `pwd` in the same directory as this README file and use that. To find your docker image, type `docker images` on your command prompt after running the `docker build ...` command above; the image is most likely the most recently built one (at the top of the list).

### `docker ...` Prodcution command

TODO: Add steps for creating a production build here.
