import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'code',
  initialState: {
    tjsconsole: `console`,
    code: `# -----hexagon-----

# {set num_sides = 6}
# {set side_length = 70}
# {set angle = 360.0 / num_sides}
  
# {for i num_sides
#     [forward side_length]
#     [right angle]
# }

# --------------


# -----star-----

# [right 75] 
# [forward 200] 
  
# {for i 4 
#     [right 144]
#     [forward 200]
# }

# --------------

# -----logo-----

# {for val 170
#     # [print "loop: "+val]
#     [forward val/7]
#     [left 10]
# }

# --------------
`
  },
  reducers: {
    change: (state, action) => {
      state.code = action.payload
    },
    addConsole: (state, action) => {
      state.tjsconsole += "\n" + action.payload
    },
    clearConsole: (state) => {
      state.tjsconsole = "console"
    }
  }
})

export const { change, addConsole, clearConsole } = counterSlice.actions

export const store = configureStore({
  reducer: counterSlice.reducer
})

