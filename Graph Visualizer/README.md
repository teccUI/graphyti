  # Core Functionality

  The application is a web-based, interactive 3D graph visualizer. Its primary purpose is to render 2D and
  3D mathematical graphs and allow users to manipulate their parameters in real-time. The core technologies
  used are React, TypeScript, Three.js (via @react-three/fiber), and Material-UI for the user interface.

# Main Features

   1. Graph Visualization:
       * The application can render a wide variety of 2D and 3D graphs, including surfaces, curves, and
         functions.
       * The rendering is done in a 3D space with a grid and labeled axes (X, Y, Z) for better spatial
         understanding.
       * The GraphRenderer.tsx component is the core of the visualization, dynamically generating the geometry
          for each graph based on its mathematical formula.

   2. Interactive Graph Controls:
       * For each graph, a set of controls (sliders) is provided in the right sidebar.
       * These controls allow users to modify the parameters of the graph's equation in real-time (e.g.,
         scaling, frequency, amplitude).
       * The GraphControls.tsx component is responsible for rendering these controls, and the
         graphControls.json file defines the available controls for each graph.

   3. Graph Selection:
       * Graphs are organized into categories and can be selected via dropdown menus in the left sidebar.
       * The LeftSidebar.tsx component handles the selection of graph categories and individual graphs.
       * The list of available graphs and their metadata is stored in graphList.json.

   4. 3D Canvas Controls:
       * The 3D view can be manipulated using a set of controls at the bottom of the canvas.
       * These controls, rendered by RightCanvas.tsx, allow the user to:
           * Zoom in and out.
           * Rotate the view, either manually or automatically.
           * Pan the view.
           * Switch to pre-defined views (front, side, top).
           * Navigate to the previous/next graph in the current category.

   5. Coordinate Inspection:
       * When the user hovers the mouse over the rendered graph, a tooltip appears displaying the mathematical
          coordinates (X, Y, Z) of the point under the cursor.
       * This feature is implemented using a combination of CanvasInspector.tsx, useCoordinateInspection.ts,
         CoordinateTooltip.tsx, and coordinateConversion.ts.

   6. Graph Information:
       * The right sidebar displays detailed information about the selected graph, including its name, LaTeX
         formula, category, and a description.
       * This information is presented in the GraphInformation.tsx component.

# User Interface
The application has a clean and modern user interface, divided into three main sections:
   * Left Sidebar: Contains the application's title and description, links to the developer's social media,
     and the dropdown menus for selecting graph categories and formulas.
   * Center Canvas: The main area where the 3D graph is rendered. It includes the 3D view itself and a set of
     floating controls for manipulating the view.
   * Right Sidebar: Features a tabbed interface for switching between "Graph Controls" and "Information". The
     "Graph Controls" tab provides sliders for adjusting the graph's parameters, while the "Information" tab
     displays details about the selected graph.

# Available Graphs

  The application includes a rich library of over 50 graphs, categorized into the following groups:
   * Quadric Surfaces: Paraboloid, Hyperbolic Paraboloid, Ellipsoid, Cone, etc.
   * Basic Surfaces: Cylinder.
   * Algebraic Surfaces: Torus, Monkey Saddle.
   * Ruled Surfaces: Helicoid.
   * Functions of Two Variables: Sine Wave Surface, Gaussian Surface.
   * Basic Functions: Linear, Quadratic, Cubic, Square Root, Absolute Value, etc.
   * Trigonometric Functions: Sine, Cosine, Tangent.
   * Exponential & Logarithmic Functions.
   * Parametric Curves: Circle, Ellipse, Cycloid, Lissajous Curve, Trefoil Knot, etc.
   * Polar Curves: Cardioid, Rose Curve, Lemniscate of Bernoulli.
   * Minimal Surfaces: Enneper Surface.
   * Physics-related Graphs: Kinematics (Position, Velocity, Acceleration vs. Time), Hooke's Law, Boyle's Law,
      I-V Characteristics of a Resistor/Diode, Blackbody Radiation, and more.

This extensive library makes the application a versatile tool for students and educators in both
  mathematics and physics.