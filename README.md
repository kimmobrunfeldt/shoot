# Shoot

**UI acceptance testing for web applications without coding a single line of code! **

Shoot crawls through a given url, takes screenshots of each page and saves them as files.
These screenshots can be compared between releases. You can view differences in images using GitHub.

## Usage

1. Run shoot

    shoot http://mypage.com

2. Commit screenshots to a separate orphan branch

        git checkout --orphan test/shoot
        git add shoot -A
        gc -m "New UI"
        git push

3. Compare your UI changes using GitHub's image diffing

## Install

Using npm

    npm install -g shoot
