# Shoot

**UI acceptanse for web applications made simple as hell.**

Shoot crawls through a given url, takes screenshots of each page and saves them as files.
These screenshots can be compared between releases.

## Usage

1. Run shoot

    shoot http://mypage.com

2. Commit screenshots and push

    git checkout test/shoot
    git add shoot -A
    gc -m "New UI"
    git push

3. Compare your UI changes using GitHub's image diffing

## Install

Using npm

    npm install -g shoot
