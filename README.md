# Shoot - UI review for web applications

[![Build Status](https://travis-ci.org/kimmobrunfeldt/shoot.png?branch=master)](https://travis-ci.org/kimmobrunfeldt/shoot)

**This is work in progess!**

Shoot crawls through a given site, takes screenshots of each page and saves them as files.
These screenshots can be compared between releases.

*You will know exactly the visual changes you make*


## Example

Push shoot history to GitHub to see nice image diff view

![Difference view](docs/diff-view.png)


## Usage

* Shoot a single url

        shoot http://google.com

* Shoot a set of urls

        shoot --urls urls.txt

    Where *urls.txt* has url on each line.

* Shoot with *crawl* mode

        shoot --crawl http://mypage.com

    This will take initial link(s) and start crawling the whole site by following links inside pages.
    Default crawler will stay on the site bounds.

To see differences visually, you can for example push shoot's directory to GitHub.


## How does it work

Shoot saves screenshots inside `.shoot` directory in the current working directory.

## Install

Using npm

    npm install -g git+https://github.com/kimmobrunfeldt/shoot.git
