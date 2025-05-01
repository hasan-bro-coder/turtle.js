import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'code',
  initialState: {
    tjsconsole: `console`,
    code: `{for val 100
    [print [join "loop: ",val]]
    [forward val/5]
    [left 10]
}
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

