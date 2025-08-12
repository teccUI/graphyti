Product Requirements Document: Interactive 3D Math Visualizer

1. Introduction & Vision
This document specifies the requirements for a single-page web application designed to be an interactive 3D visualizer for mathematical graphs and formulas. The vision is to transform abstract mathematical concepts into tangible, interactive 3D models. By allowing students to see and manipulate these complex forms, we aim to deepen their intuition, understanding, and engagement in mathematics and physics.

2. Target Audience & User Personas
Persona 1: The High School Student (e.g., "Maria," 17)
Needs: Studying Calculus and needs to understand the relationship between 2D functions and 3D surfaces. Finds textbook diagrams static and unhelpful.
Goals: Wants to easily see what a function of two variables looks like, rotate it to understand its shape from all angles, and see how changing a parameter affects the surface.
Persona 2: The University Student (e.g., "David," 20)
Needs: A physics or engineering major studying multivariable calculus and vector fields. Needs to visualize complex concepts like gradients, curl, divergence, and different coordinate systems (cylindrical, spherical).
Goals: Wants a tool that can plot not just pre-set formulas but also custom equations. Needs to visualize vector fields to understand fluid dynamics or electromagnetism concepts.
Persona 3: The Educator (e.g., "Mr. Evans," 42)
Needs: A high school math teacher looking for engaging tools to use in the classroom for live demonstrations.
Goals: Wants a simple, reliable tool to quickly bring up a visualization to explain a concept. Values the ability to share a specific view or setup with students.

3. Features
Features are broken down into prioritized phases for manageable development. Currently only Phase 1 exists in this document.

**Phase 1: Minimum Viable Product (MVP)**

F1.1: Pre-defined Graph Library: A dropdown menu to select from a curated list of foundational 3D graphs. 

F1.2: 3D Visualization Canvas:
A dedicated, large area of the screen where the selected graph is rendered.

F1.3: Core Camera Controls:
Rotate: 360-degree orbital rotation of the camera around the graph using mouse controls.
Zoom: Zoom in and out on the graph using mouse controls.
Pan: Move the camera's viewpoint left, right, up, and down using mouse controls.

F1.4: Axes and Grid Display:
Display of labeled X, Y, and Z axes and a ground plane grid to provide spatial context.

F1.5: Formula Display:
The mathematical formula for the currently displayed graph is always visible on-screen.



# Documentation websites for the installed libraries
Three.js: threejs.org/docs/
React Three Fiber: docs.pmnd.rs/react-three-fiber
Drei: github.com/pmndrs/drei
Material-UI (MUI): mui.com/material-ui/getting-started/
math.js: mathjs.org/docs/


### Image with typography and icon size specifications:
![alt text](image.png)
Has ground plane grid displayed in the graph render area


### Image with typography and icon size specifications:
![alt text](<Graph Visualizer/annotations.png>)



# Notes:
viewport width: 1440px
viewport height: 100VH
icon size: 16px 
icon bounding box: 30px
user control panel width, height: 242px, 38px
logo-text: 24px, semi-bold, -0.2px letter spacing, line height auto 
