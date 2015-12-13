Envy My Simplex
===============

A WebGL shooter game based on code from [NVMyCar](http://www.envymycarbook.com/). Final project of Yale University CPSC 478 (Computer Graphics)

By David Yao, source code at [Github](https://github.com/njlxyaoxinwei/envymygun)

## Description

### Concept of game

In the game, the target moves from a column top to another and shrinks and disappears when it reaches the last column of its route. There is also a character who can shoot a simplex from its arm. The goal is to hit the target with the simplex before it disappears.

The blinking simplex bullet is unique and hence only refills itself for the character when the previously shot bullet goes out of the game field without hitting the target. 

There are various view modes (6 of them) available.

### Basic graphic elements

All elements are made up by simple primitives created in previous assignments.

#### Character

The character is the most complex object in the scene. It walks on a wheel and has moving legs, an arm and another as gun barrel. It can be best observed in the photographer view.

The wheel turns with respect to the character's current velocity in the forward-facing direction.

The legs have one degree of freedom and move at a speed that corresponds to the movement of the wheel, which in turn corresponds to the character's forward speed. When the legs are taking a step, the center of mass of the character sinks slightly and it is in fact reflected in the rendering to make the walking on wheel seem more natural, and this also explains the "_bumpy_" feeling of First-Person view as well as the bullet view when the character is moving forward.

The left arm moves at a speed proportional to the speed of the legs, which ultimately corresponds to the character's forward speed. It has one degree of freedom.

The gun barrel is controlled by the user and two degrees of freedom. The reason that it can move horizontally with respect to the body is because the turning provided by NVMC is too crude for a shooting game and hence additional finer horizontal control is provided.

The character is defined in `character.js` and the entire geometry specification is defined in `params_` attribute:

```js
  this.params_ = {
    wheel: {
      theta: 0.0,
      deltaT: 0.025,
      radius: 0.3,
      length: 1,
      color: [0.51, 0.32, 0.0, 1.0],
    },
    leg: {
      angle: 0.0,
      t: 0.0,
      deltaT: 0.05,
      maxAngle: 0.25,
      sideLength: 0.16,
      length: 0.6,
      spaceBetween: 0.24,
      color: [0.8, 0.2, 0.2, 1.0],
    },
    torso: {
      height: 0.6,
      width: 0.6,
      thickness: 0.3,
      color: [0.8, 0.15, 0.15, 1.0],
    },
    leftArm: {
      t: 0.0,
      deltaT: 0.0125,
      maxAngle: 0.15,
      sideLength: 0.14,
      length: 0.8,
      shoulderOffsetX: 0.1,
      color: [0.8, 0.2, 0.2, 1.0],
    },
    gun: {
      thetaH: 0.0,
      thetaV: 0.0,
      deltaT: 0.01,
      maxTH: 0.5,
      minTH: -0.5,
      maxTV: 0.5,
      minTV: -0.1,
      turningLeft: false,
      turningRight: false,
      turningUp: false,
      turningDown: false,
      radius: 0.1,
      length: 0.8,
      shoulderOffsetX: 0.0,
      color: [0.9, 0.05, 0.05, 1.0],
    },
    head: {
      radius: 0.2,
      color: [0.8, 0.1, 0.1, 1.0],
    },
  };
```

#### Column

Columns are slight modification of the trees in NVMC, but with colors and wider tops so that the color can be seen clearly in the Bird's Eye View. Its height is also changed from constant to randomly varied values. Its coordinates are also randomly generated for each game.

If we number the columns, then the top positions of columns numbered 3k, 3k+1, 3k+2, 3(k+1) define a Bezier curve, and together the union of the curves defines a long curve which is smooth almost everywhere except at column 3k where it loses C1 continuity. This long curve is in fact the route taken by the target.

#### Target

The target is just a sphere following the curve defined in previous section. It actually moves with roughly constant speed because I pre-calculated a line-integral table for looking up the right parameter value for the spline from the distance it has covered.

Since the route is a union of Bezier curves, the target only visits some of the trees. The color of the target changes from bright green to bright red as it approaches its destination, and its colors are matched by those of the column tops where the target makes its stops.

When the target is hit, it explodes into pieces of little triangles. I implemented the explosion by reconstructing the sphere by disjoint triangles and add a random velocity for each triangle. To make the explosion look better, I also take into account the velocity of the target (in the _tangent_ direction of the spline) when it is hit by the simplex, and add that vector on top of the random vector for each triangle so that it would appear as if the triangles were thrown out by inertia.

#### Simplex

The simplex is just another name for the tetrahedron primitive we defined for a previous assignment. It is always blinking, and when it is in the gun barrel it is red, and once shot it becomes blue and appears twice is large. It blows up to five times as big and stays stationary at the collision point when it hits the target. It returns to the gun once it goes out of bound of the game field, which is 100 by 100 with height 20.

A side effect of this setup is that one cannot fire the bullet outside the game field, since once shot, the bullet, being out of bound, returns to the gun immediately.

The trajectory of the bullet is a straight line. The speed is constant _relative to the character when it is fired_. That is, if the character is backing up, the bullet shot will move much slower than if the character is moving forward.

#### Lighting

The game uses a lighting model with 0.1 ambient and 0.9 lambertian lighting. The sun completes a half circle across the diagonal of the game field as the target completes the spline. The sun light color changes from bright orange to white at noon then to orange again at dusk.

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

### Two challenging aspects

  1. The character with moving body parts. 
    The character is described in detail in the previous [Character section][character-basic]. Everything from the character states to its rendering is encapsulated in the `Character` Class. As for the moving parts, I used a lot of parameter values in the `params_` to indicate the various angles by which the joints are turned. For the velocity, I used `NVMCClient.game.state.players.me.dynamicState.linearVelocity` which is in world coordinate, and with linear algebra extracted the forward-facing component.
  2. The target moving at constant speed along a pre-calculated spline.
    See the previous sections on [columns][column-basic] and [target][target-basic] on how the spline is calculated. I have a `BezierSpline` Class and a `CompositeSpline` Class. For a Bezier Curve I computed a table with entries of pairs (t, s) where s is the value of the approximated line integral from 0 to t. A `CompositeSpline` is initialized with two curves, and I implemented methods to join the line integral table, as well as all the public interface of a spline.

### Overview of all files

- index.html
- js/
    + client/ (Code for NVMCClient Object)
        * client-events.js
        * client-init.js
        * client-draw.js
    + geometry/
        * primitives/
            - cone.js
            - cube.js
            - cylinder.js
            - quadrilateral.js
            - sphere_subd.js
            - tetrahedron.js
        * nvmc/
            - building.js
            - track.js
    + shaders/
        * uniform-shader.js
    + cameras.js
    + bullets.js
    + characters.js
    + splines.js
    + targets.js
    + nvmc-race-data.js (Data for game field dimensions, and generating randomized coordinates for the columns)

### Testing Environment

Chromium Version 47.0.2526.73 Built on Ubuntu 14.04, running on LinuxMint 17.1 (64-bit)

## Screenshots

![First-Person View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc1.png)
![Photographer View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc2.png)
![Bird's Eye View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc3.png)
![Target in View](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc4.png)
![Target Hit](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc5.png)
![Target Pieces](https://raw.githubusercontent.com/njlxyaoxinwei/envymygun/master/Screenshots/sc6.png)

[character-basic]: #character
[column-basic]: #column
[target-basic]: #target
