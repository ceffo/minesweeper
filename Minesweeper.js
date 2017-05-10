"use strict";

var ceffo = ceffo || {};
ceffo.minesweeper = ceffo.minesweeper || {};

(function(ns) {
    ns.CellState = {
        get UNKNOWN() {
            return undefined;
        },
        get DISCOVERED() {
            return 1;
        },
        get DISCOVERED_BOMB() {
            return 2;
        },
        get EXPLODED_BOMB() {
            return 3;
        },
        get MARKED() {
            return 4;
        },
        get DISCOVERED_ERROR() {
            return 5;
        }
    }

    ns.Board = class Board {
        get BOMB() {
            return "B";
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get bombCount() {
            return this._bombCount;
        }
        get leftToDiscover() {
            return this._cellsToDiscover - this._bombCount;
        }
        get allCellsDiscovered() {
            return this._cellsToDiscover == this._bombCount;
        }

        getIndex(row, column) {
            if (row < 0)
                return undefined;
            if (column === undefined) {
                // row only
                if (row >= this._cells.length)
                    return undefined;
                return row;
            }

            // row and column
            if (row >= this.height)
                return undefined;
            if (column < 0 || column >= this.width)
                return undefined;
            return row * this.width + column;
        };

        mark(row, column) {
            var index = this.getIndex(row, column);
            var newState = undefined;
            switch (this._states[index]) {
                case ns.CellState.MARKED:
                    newState = ns.CellState.UNKNOWN;
                    break;
                case ns.CellState.UNKNOWN:
                    newState = ns.CellState.MARKED;
                    break;
                default:
                    return undefined;
            }
            console.log(`Board.mark changing ${row},${column} from ${this._states[index]} to ${newState}`);
            this._states[index] = newState;
            return newState === ns.CellState.MARKED;
        };

        cell(row, column, value) {
            switch (arguments.length) {
                case 0:
                    return undefined;
                case 1:
                case 2:
                    return this._cells[this.getIndex(row, column)];
                default:
                    this._cells[this.getIndex(row, column)] = value;
                    if (value == this.BOMB) {
                        for (var yy = row - 1; yy <= row + 1; ++yy) {
                            if (yy < 0 || yy >= this.height)
                                continue;

                            for (var xx = column - 1; xx <= column + 1; ++xx) {
                                if (xx < 0 || xx >= this.width)
                                    continue;

                                var index = this.getIndex(yy, xx);
                                var c = this._cells[index];
                                if (c == this.BOMB)
                                    continue;
                                else if (c === undefined)
                                    c = 1;
                                else
                                    ++c;
                                this._cells[index] = c;
                            }
                        }
                    }
                    return value;
            }
        };

        discoverCell(row, column) {
            let index = this.getIndex(row, column);
            if (this._states[index] !== ns.CellState.UNKNOWN)
                return [];
            let result = [];
            let _self = this;

            let recursiveDiscover = function(r, c) {
                let idx = _self.getIndex(r, c);
                if (_self._states[idx] !== ns.CellState.UNKNOWN)
                    return;

                _self._states[idx] = ns.CellState.DISCOVERED;
                result.push({
                    row: r,
                    column: c,
                    state: ns.CellState.DISCOVERED
                });
                --_self._cellsToDiscover;
                if (_self.cell(idx) !== undefined)
                    return;

                for (let y = r - 1; y <= r + 1; ++y) {
                    if (y < 0 || y >= _self.height)
                        continue;

                    for (let x = c - 1; x <= c + 1; ++x) {
                        if (x < 0 || x >= _self.width)
                            continue;

                        recursiveDiscover(y, x);
                    }
                }
            };

            recursiveDiscover(row, column);
            if (this.allCellsDiscovered) {
                result = result.concat(this.discoverCells());
            }
            return result;
        }

        discoverCells() {
            let result = [];
            let index = 0;
            for (let y = 0; y < this.height; ++y) {

                for (let x = 0; x < this.width; ++x, ++index) {
                    let newState = undefined;
                    switch (this._states[index]) {
                        case ns.CellState.DISCOVERED:
                            continue;
                        case ns.CellState.UNKNOWN:
                            newState = this.cell(index) == this.BOMB ?
                                ns.CellState.DISCOVERED_BOMB :
                                ns.CellState.DISCOVERED;
                            break;
                        case ns.CellState.EXPLODED_BOMB:
                            newState = ns.CellState.EXPLODED_BOMB;
                            break;
                        case ns.CellState.MARKED:
                            newState = this.cell(index) == this.BOMB ?
                                ns.CellState.DISCOVERED_BOMB :
                                ns.CellState.DISCOVERED_ERROR;
                            break;
                    }
                    this._states[index] = newState;
                    result.push({
                        row: y,
                        column: x,
                        state: newState
                    });
                }
            }
            return result;
        }

        discover(row, column) {
            let index = this.getIndex(row, column);
            let c = this.cell(index);
            let s = this._states[index];
            //console.log(`discover ${row},${column} idx:${index} c:${c} s:${s}`);
            if (s !== ns.CellState.UNKNOWN)
                return [];
            if (c === this.BOMB) {
                this._states[index] = ns.CellState.EXPLODED_BOMB;
                return this.discoverCells();
            } else
                return this.discoverCell(row, column);
        }

        constructor(height, width, bombCount) {
            if (height === undefined || height <= 0)
                throw "'height' must be a positive number";
            if (width === undefined || width <= 0)
                throw "'width' must be a positive number";
            if (bombCount === undefined || bombCount < 0)
                throw "'bombCount' must be a positive number";

            var max = width * height;

            this._width = width;
            this._height = height;
            this._bombCount = Math.min(bombCount, max);
            this._cells = new Array(max);
            this._states = new Array(this._cells.length);
            this._cellsToDiscover = max;

            // Fill in the temporary array of cells
            var array = new Array(max);
            for (var i = 0; i < max; ++i)
                array[i] = i;
            // Switch random indexes
            for (var i = 0; i < max * 5; ++i) {
                var n1 = Math.floor(Math.random() * max);
                var n2 = Math.floor(Math.random() * max);
                var temp = array[n1];
                array[n1] = array[n2];
                array[n2] = temp;
            }

            // Filling the board with bombs
            for (var i = 0; i < this.bombCount; ++i) {
                var x = array[i] % this.width;
                var y = Math.floor(array[i] / this.width);
                this.cell(y, x, this.BOMB);
            }

        }
    };

    ns.TableBoard = class TableBoard {

        notify(text, className) {
            let target = document.getElementById("result");
            target.innerText = text;
            if (className !== undefined)
                target.className = className;
        }

        printLeft() {
            let par = document.getElementById("result");
            par.innerText = this._board.leftToDiscover + " left to discover";
            par.className = '';
        }

        mark(td, row, column) {
            var _self = this;

            return function(evt) {
                evt.preventDefault();
                var res = _self._board.mark(row, column);
                console.log(`marked ${row},${column}: ${res}`)
                if (res === true)
                    td.className = "mark";
                else if (res === false)
                    td.className = '';
            };
        }

        discover(row, column) {
            var _self = this;

            return function() {
                let discovered = _self._board.discover(row, column);
                let lost = false;

                discovered.forEach(function(cell) {

                    var tr = _self._tbody.getElementsByTagName("tr")[cell.row];
                    var td = tr.getElementsByTagName("td")[cell.column];

                    if (cell.state === ns.CellState.DISCOVERED_BOMB) {
                        td.className = "discovered bomb";
                    } else if (cell.state === ns.CellState.EXPLODED_BOMB) {
                        td.className = "discovered explodedbomb";
                        lost = true;
                    } else if (cell.state === ns.CellState.DISCOVERED_ERROR) {
                        td.className = "discovered error";
                    } else {
                        let val = _self._board.cell(cell.row, cell.column) || '';
                        td.className = "discovered l" + val;
                        td.innerText = val;
                    }
                });

                _self.printLeft();

                if (lost) {
                    _self.notify("you lost!", "lost");
                } else
                if (_self._board.allCellsDiscovered) {
                    _self.notify("you won!", "won");
                }

            }
        }

        onreset() {
            var _self = this;

            return function() {
                _self.reset();
            }
        }

        oninputchanged() {
            var _self = this;

            return function(ev) {
                _self._bombCountInput.setAttribute("max", _self._height * _self._width);
                document.getElementById("bombOut").value = _self._bombCountInput.value + " bombs";
                _self._width = _self._widthInput.value;
                _self._height = _self._heightInput.value;
                _self._bombCount = _self._bombCountInput.value;
                _self.reset();
            }
        }

        constructor(table, height, width, bombCount) {
            this._height = height;
            this._width = width;
            this._bombCount = bombCount;
            this._table = table;
            this._tbody = undefined;

            // connect reset button
            var btn = document.getElementById("restart");
            btn.onclick = this.onreset();

            // connect inputs
            this._heightInput = document.getElementById("height");
            this._heightInput.setAttribute("value", this._height);

            this._widthInput = document.getElementById("width");
            this._widthInput.setAttribute("value", this._width);

            this._bombCountInput = document.getElementById("bombCount");
            this._bombCountInput.setAttribute("value", this._bombCount);

            this._widthInput.onchange = this.oninputchanged();
            this._heightInput.onchange = this.oninputchanged();
            this._bombCountInput.oninput = this.oninputchanged();
            this.oninputchanged()();

        }

        reset() {
            this._board = new ns.Board(this._height, this._width, this._bombCount);
            // create new table body
            let tbody = document.createElement('tbody');

            for (let y = 0; y < this._board.height; ++y) {
                let tr = document.createElement("tr");

                for (let x = 0; x < this._board.width; ++x) {
                    let td = document.createElement("td");
                    td.onclick = this.discover(y, x);
                    td.oncontextmenu = this.mark(td, y, x);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }

            if (this._tbody !== undefined) {
                table.replaceChild(tbody, this._tbody);
            } else {
                table.appendChild(tbody);
            }
            this._tbody = tbody;
            this.printLeft();
        }

    };
})(ceffo.minesweeper);