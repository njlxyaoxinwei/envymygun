Envy My Simplex
===============

A WebGL shooter game based on code from [NVMyCar](http://www.envymycarbook.com/). Final project of Yale University CPSC 478 (Computer Graphics)

By David Yao, source code at [Github](https://github.com/njlxyaoxinwei/envymygun)

## Description

### Concept of game

In the game, the target moves from a column top to another and shrinks and disappears when it reaches the last column of its route. There is also a character who can shoot a simplex from its arm. The goal is to hit the target with the simplex before it disappears.

The blinking simplex bullet is unique and hence only refills itself for the character when the previously shot bullet goes out of the game field without hitting the target. 

There are various view modes (6 of them) available.

### How to play Envy My Simplex

Open `index.html`, __click on the canvas on the webpage__ to start playing. To play another game just refresh (and re-click the canvas). The game starts immediately after the webpage loads but one cannot use keyboard commands until he clicks the canvas.

A comprehensive instruction is on `index.html`, copied here:

#### Objective

Shoot the moving ball before it reaches its last column, the one with the bloody red top.

#### List of views

  0. First-person view
  View from the eye of the character

  1. Bullet Chaser view
  View from close to the front of the simplex (bullet). 
  
  2. Target Chaser view
  View from behind the target(ball).
  3. Bird's-eye view
  Orthogonal projection viewed from the sky. Can see the whole game field.

  4. Character Chaser view
  View from behind the character.

  5. Photographer view
  Fixed observer at the center of the game field. Can lock view to the character or the target.

#### Instructions

  1. General Instructions
    - [1/2]: Go to the previous/next view.
    - [W/S]: Character moves forward/backward.
    - [A/D]: Character turns left/right.
    - [E]: Fire! 
    - [T/G]: Raise/Lower the gun. 
    - [F/H]: Point gun slightly to the left/right.
  2. Special Command in Photographer View
    - [R/V]: Stand up / Lower himself.
    - [L/U]: Lock/Unlock camera to character.
    - [P/O]: Lock/Unlock camera to target.

## Screenshots

![First-Person View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc1.png)
![Bird's Eye View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc2.png)
![Character Chaser View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc3.png)
![Photographer View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc4.png)
![Target Pieces](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc5.png)

[character-basic]: #character
[column-basic]: #column
[target-basic]: #target
