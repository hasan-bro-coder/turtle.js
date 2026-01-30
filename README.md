# TurtleJS

A sandbox for making generative art and geomatric designs like turtle.py with a simple custom language

![language logo](/public/icon.png "Logo")

## Why TurtleJS?

TurtleJS was created to make geometric art creation hyper-fast and accessible to everyone. making it even simpler then turtle.py 

TurtleJS provides:

- **Fast & Easy**: Experiment and create beautiful geometric art in seconds
- **Web-Based**: runs in your browser with instant results so can be used on any device
- **Excellent Editor**: Built-in code editor (code mirror 6) with auto complete and syntax highlighting
- **Mobile-Friendly**: Full mobile support with PWA and offline mode
- **Kid-Friendly**: Simple enough to teach children programming through visual creativity


Whether you're a student learning to code, an artist exploring generative designs, or a teacher introducing programming concepts, TurtleJS makes it simple and fun.


---

## Table of Contents

### Getting Started
- [Documentation](#documentation)
    * [Variables](#variables)
    * [Comments](#comments)
    * [Conditional Statements (If/Else)](#conditional-statements-ifelse)
    * [Loop Statement (While Loop)](#loop-statement-while-loop)
    * [For Loop](#for-loop)
    * [Functions](#functions)

### Reference
- [TurtleJS vs Python](#turtlejs-vs-python-key-differences)
- [Command Reference (Cheat Sheet)](#command-reference-cheat-sheet)
---


## Documentation


#### Variables

```py
sides = 5
angle = 360 / sides
name = "circle"
is_circle = true
x_pos = [getx]
```

#### Comments

Lines starting with `#` are comments and are ignored during execution. Use them to document your code.

```py
# This is a comment
forward 100  # This draws a line
# sides = 8  # This code is disabled
```

#### Conditional Statements (If/Else)

Control program flow based on conditions. Conditions can compare values using `==`, `!=`, `<`, `>`, `<=`, `>=` and `&`,`|` . theres no !(not) oparator

**Basic If:**
```py
x = 10
if x > 5 do
    forward 100
end
```

**If-Else:**
```py
age = 15
if age >= 18 do
    write "Adult"
else do
    write "Minor"
end
```

**If-Else If-Else:**
```py
score = 85
if score >= 90 do
    color "gold"
    write "A Grade"
end
else if score >= 80 do
    color "silver"
    write "B Grade"
end
else if score >= 70 do
    color "bronze"
    write "C Grade"
end
else do
    color "gray"
    write "Try harder"
end
```

**Logical Operators:**
```py
x = 10
y = 20

# AND - both conditions must be true
if x > 5 & y < 30 do
    forward 50
end

# OR - at least one condition must be true
if x < 5 | y > 15 do
    right 90
end

# NOT - inverts the condition
if x != 5 do
    left 45
end
```

#### Loop Statement (While Loop)

```py
# Count up
i = 0
loop i < 5 do
    forward 50
    right 72
    i = i + 1
end
```

```py
# Draw until reaching edge
x = 0
right 90
loop x < [width] do
    forward 10
    x = [getx]
end

```

```py
# Countdown
count = 10
loop count > 0 do
    write count
    forward 20
    count = count - 1
    wait 1000
end
```

#### For Loop

The `for` loop repeats a block of code a specific number of times. The loop variable automatically increments from 0 to count-1.

**Basic For Loop:**
```py
# Repeats 4 times (i = 0, 1, 2, 3)
for i 4 do
    forward 100
    right 90
end
```

**Using the Loop Variable:**
```py
# Draw increasing spiral
for i 100 do
    forward i * 2
    right 59
end
```

**Nested For Loops:**
```py
# Draw a grid of squares
for row 5 do
    for col 5 do
        forward 50
        right 90
        forward 50
        right 90
        forward 50
        right 90
        forward 50
        right 90
        forward 50  # Move to next position
    end
    
    # Move to next row
    up
    move 50,250
    down
end
```

**Loop with Complex Expressions:**
```py
sides = 5
for i 360 do
    forward i * 2 / sides + i
    left 360 / sides + 1.5
end
```

#### Functions

Define reusable blocks of code with parameters and the last value is returned.

**Defining a Function:**
```py
fn square(size) do
    for i 4 do
        forward size
        right 90
    end
end
```

**Calling a Function:**
```py
square 100    # Draw a 100x100 square
square 50     # Draw a 50x50 square
```

**Functions with Multiple Parameters:**
```py
fn rectangle (width, height) do
    for i 2 do
        forward width
        right 90
        forward height
        right 90
    end
end

rectangle 100, 50
clear
rectangle 80, 120
```

**Functions with Return Values:**
```py
hidepen
fn distance(x1, y1, x2, y2) do
    dx = x2 - x1
    dy = y2 - y1
    [sqrt dx * dx + dy * dy] # this value is returned
end

dist = [distance 0, 0, 30, 40]
write dist
```

**Calling Functions and Storing Results:**

Use square brackets `[]` to call functions and store their return values:

```py
# Built-in functions
x = [getx]
y = [gety]
random = [randint 1, 100]
canvasWidth = [width]

# Custom functions
result = [myFunction 10, 20]
area = [calculateArea radius]
```

**Recursive Functions:**
```py
fn spiral(size, angle) do
    if size > 5 do
        forward size
        right angle
        spiral size - 2, angle
    end
end

spiral 100, 89
```

**Example: Drawing Shapes with Functions:**
```py
fn polygon(sides, length) do
    angle = 360 / sides
    for i sides do
        forward length
        right angle
    end
end

# Draw different polygons
polygon 3, 100   # Triangle
clear
polygon 5, 80    # Pentagon
clear
polygon 8, 60    # Octagon
```


## TurtleJS vs Python: Key Differences

| Feature | TurtleJS | Python |
|---------|----------|--------|
| **Statements** | `if x > 5 do ... end` | `if x > 5:` |
| **Logical AND** | `x > 5 & y < 10` | `x > 5 and y < 10` |
| **Logical OR** | `x < 5 \| y > 10` | `x < 5 or y > 10` |
| **Logical NOT** | `there is no not oparator` | `not (x == 5)` |
| **For Loop** | `for i 10 do ... end` | `for i in range(10):` |
| **Function Definition** | `fn name (param1, param2) do ... end` | `def name(param1, param2):` |
| **Function Call** | `myFunc 10, 20` | `myFunc(10, 20)` |
| **Function Return** | `the value or the last line is returned` | `myFunc(10, 20)` |
| **Call with Return** | `result = [myFunc 10]` | `result = myFunc(10)` |
| **Built-in Function Call** | `x = [randint 1, 10]` | `x = randint(1, 10)` |
| **Block Delimiters** | `do ... end` | `: ... (indentation)` |
| **Indentation** | Not required | Required |




## Command Reference (Cheat Sheet)

### Movement
| Command | Description | Example |
|---------|-------------|---------|
| `forward <n>` | Move forward n units | `forward 100` |
| `backward <n>` | Move backward n units | `backward 50` |
| `left <angle>` | Turn left by angle degrees | `left 90` |
| `right <angle>` | Turn right by angle degrees | `right 45` |
| `goto <x>, <y>` | Move to coordinates (x, y) | `goto 0, 0` |
| `move <x>, <y>` | Move relative to current position | `move 50, 30` |
| `setx <x>` | Set x coordinate | `setx 100` |
| `sety <y>` | Set y coordinate | `sety -50` |
| `angle <degrees>` | Set absolute heading angle | `angle 90` |

### Pen Control
| Command | Description | Example |
|---------|-------------|---------|
| `up` | Lift pen (don't draw) | `up` |
| `down` | Lower pen (draw) | `down` |
| `hidepen` | Hide turtle cursor | `hidepen` |
| `showpen` | Show turtle cursor | `showpen` |

### Appearance
| Command | Description | Example |
|---------|-------------|---------|
| `color <r>, <g>, <b>` | Set pen color with RGB values (0-255) | `color 255, 0, 0` |
| `color <hex>` | Set pen color with hex code | `color "#ff0000"` |
| `color <name>` | Set pen color with CSS name | `color "red"` |
| `size <width>` | Set line thickness | `size 3` |
| `speed <value>` | Set drawing speed (-1 for instant) | `speed 100` |

### Shapes & Filling
| Command | Description | Example |
|---------|-------------|---------|
| `circle <radius>` | Draw a complete circle | `circle 50` |
| `arc <radius>, <extent>` | Draw an arc with specified angle | `arc 50, 180` |
| `dot` | Draw a dot at current position | `dot` |
| `bfill` | Begin filling a shape | `bfill` |
| `efill` | End filling and fill the shape | `efill` |

### Text & Canvas
| Command | Description | Example |
|---------|-------------|---------|
| `write <text>` | Write text at current position | `write "Hello"` |
| `clear` | Clear the canvas (keep turtle position) | `clear` |
| `reset` | Reset canvas and turtle to initial state | `reset` |

### Information
| Command | Description | Example |
|---------|-------------|---------|
| `getx` | Get current x coordinate | `x = [getx]` |
| `gety` | Get current y coordinate | `y = [gety]` |
| `width` | Get canvas width | `w = [width]` |
| `height` | Get canvas height | `h = [height]` |

### Utility
| Command | Description | Example |
|---------|-------------|---------|
| `randint <min>, <max>` | Random integer between min and max | `n = [randint 1, 10]` |
| `wait <ms>` | wait for miliseconds | `wait 1000` |
---

## Contribution

Contributions are welcome! If you find a bug or have a feature request, please open an Issue or submit a Pull Request.

## License

see `LICENSE.txt`

## Contact

Hasanur Rahman - Discord: @hasan890 - hasanur23910@gmail.com
