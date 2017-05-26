
var board;

function assertBoard(assert, board, height, width, expectedBombs) {
    assert.strictEqual(board.height, height, "height");
    assert.strictEqual(board.width, width, "width");
    assert.strictEqual(board.bombCount, expectedBombs, "bombCount");
}

function assertBombs(assert, board, expectedBombs) {
    var count = 0;
    for (let y = 0; y < board.height; ++y)
        for (let x = 0; x < board.width; ++x)
            if (board.cell(y, x) === board.BOMB)
                ++count;
    assert.strictEqual(count, expectedBombs);
}

function assertCells(assert, board, array) {
    for (let y = 0; y < board.height; ++y)
        for (let x = 0; x < board.width; ++x)
            assert.equal(board.cell(y, x) || 0, array[y][x], `cell(${y},${x})`);
}


function assertBombsAroundCell(assert, board, row, column) {
    var count = 0;
    for (let y = row - 1; y <= row + 1; ++y) {
        if (y < 0 || y >= board.height)
            continue;

        for (let x = column - 1; x <= column + 1; ++x) {
            if (x < 0 || x >= board.width)
                continue;

            if (board.cell(y, x) === board.BOMB)
                ++count;
        }
    }
    assert.strictEqual(count, board.cell(row, column) || 0, `bombs around cell(${row},${column}): ${count}`);
}

function assertBombsInBoard(assert, board) {
    for (let row = 0; row < board.height; ++row)
        for (let column = 0; column < board.width; ++column)
            if (board.cell(row, column) !== board.BOMB)
                assertBombsAroundCell(assert, board, row, column);
}

// Tests

QUnit.module("Board Constructor");
QUnit.test("Board constructor should correctly initialize parameters",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(2, 3, 1);

        // Assert
        assertBoard(assert, board, 2, 3, 1);
    });

QUnit.test("'width' must be strictly positive: undefined",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(undefined, 3, 1));
    });

QUnit.test("'width' must be strictly positive: 0",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(0, 3, 1));
    });

QUnit.test("'width' must be strictly positive: negative",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(-1, 3, 1));
    });

QUnit.test("'height' must be strictly positive: undefined",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(2, undefined, 1));
    });

QUnit.test("'height' must be strictly positive: 0",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(2, 0, 1));
    });

QUnit.test("'height' must be strictly positive: negative",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(2, -1, 1));
    });

QUnit.test("'bombCount' must be positive: 0",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(2, 3, 0);

        // Assert
        assertBoard(assert, board, 2, 3, 0);
    });

QUnit.test("'bombCount' must be positive: undefined",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(2, 3, undefined));
    });
    
    QUnit.test("'bombCount' must be positive: negative",
    function(assert) {
        // Act & Assert
        assert.throws(() => new ceffo.minesweeper.Board(2, 3, -2));
    });

QUnit.test("The specified number of bombs should be retrieved in the cells of the built instance: 0",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(3, 2, 0);

        // Assert
        assertBoard(assert, board, 3, 2, 0);
        assertBombs(assert, board, 0);
    });

QUnit.test("The specified number of bombs should be retrieved in the cells of the built instance: 1",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(3, 2, 1);

        // Assert
        assertBoard(assert, board, 3, 2, 1);
        assertBombs(assert, board, 1);
    });

QUnit.test("The specified number of bombs should be retrieved in the cells of the built instance: max",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(3, 2, 6);

        // Assert
        assertBoard(assert, board, 3, 2, 6);
        assertBombs(assert, board, 6);
    });

QUnit.test("The specified number of bombs should be retrieved in the cells of the built instance: above max",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(3, 2, 8);

        // Assert
        assertBoard(assert, board, 3, 2, 6);
        assertBombs(assert, board, 6);
    });


QUnit.module("Nearest cells", {
    beforeEach: function(assert) {
        board = new ceffo.minesweeper.Board(5, 6, 0);
        assertBoard(assert, board, 5, 6, 0);
        B = board.BOMB;
    }
});

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 0",
    function(assert) {

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 in the middle",
    function(assert) {

        // Act
        board.cell(2, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, B, 1, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 at the top",
    function(assert) {

        // Act
        board.cell(0, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, B, 1, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 at the bottom",
    function(assert) {

        // Act
        board.cell(4, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, B, 1, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the left",
    function(assert) {

        // Act
        board.cell(2, 0, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [B, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the right",
    function(assert) {

        // Act
        board.cell(2, 5, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 1, B],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the top left",
    function(assert) {

        // Act
        board.cell(0, 0, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [B, 1, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the top right",
    function(assert) {

        // Act
        board.cell(0, 5, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 1, B],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the bottom right",
    function(assert) {

        // Act
        board.cell(4, 5, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 1, B]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: 1 on the bottom left",
    function(assert) {

        // Act
        board.cell(4, 0, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0],
                [B, 1, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two horizontally adjacent bombs",
    function(assert) {

        // Act
        board.cell(2, 3, board.BOMB);
        board.cell(2, 4, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 0, 1, 2, 2, 1],
                [0, 0, 1, B, B, 1],
                [0, 0, 1, 2, 2, 1],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two horizontally separated bombs",
    function(assert) {

        // Act
        board.cell(2, 2, board.BOMB);
        board.cell(2, 4, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [0, 1, 1, 2, 1, 1],
                [0, 1, B, 2, B, 1],
                [0, 1, 1, 2, 1, 1],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two horizontally distant bombs",
    function(assert) {

        // Act
        board.cell(2, 1, board.BOMB);
        board.cell(2, 4, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1],
                [1, B, 1, 1, B, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two vertical adjacent bombs",
    function(assert) {

        // Act
        board.cell(1, 3, board.BOMB);
        board.cell(2, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, 1, 1, 0],
                [0, 0, 2, B, 2, 0],
                [0, 0, 2, B, 2, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two vertically separated bombs",
    function(assert) {

        // Act
        board.cell(1, 3, board.BOMB);
        board.cell(3, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, B, 1, 0],
                [0, 0, 2, 2, 2, 0],
                [0, 0, 1, B, 1, 0],
                [0, 0, 1, 1, 1, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two vertically distant bombs",
    function(assert) {

        // Act
        board.cell(1, 3, board.BOMB);
        board.cell(4, 3, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, B, 1, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 0],
                [0, 0, 1, B, 1, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two diagonal bombs",
    function(assert) {

        // Act
        board.cell(1, 3, board.BOMB);
        board.cell(2, 2, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, 1, 1, 0],
                [0, 1, 2, B, 1, 0],
                [0, 1, B, 2, 1, 0],
                [0, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two diagonal distant bombs",
    function(assert) {

        // Act
        board.cell(1, 3, board.BOMB);
        board.cell(2, 1, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 0, 1, 1, 1, 0],
                [1, 1, 2, B, 1, 0],
                [1, B, 2, 1, 1, 0],
                [1, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: two other diagonal distant bombs",
    function(assert) {

        // Act
        board.cell(1, 2, board.BOMB);
        board.cell(2, 4, board.BOMB);

        // Assert
        assertCells(assert,
            board, [
                [0, 1, 1, 1, 0, 0],
                [0, 1, B, 2, 1, 1],
                [0, 1, 1, 2, B, 1],
                [0, 0, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 0]
            ]);
    });

QUnit.test("When a cell contains a number, we must find this exact number of nearest cells containing a bomb: board full of bombs",
    function(assert) {
        // Act
        const board = new ceffo.minesweeper.Board(5, 6, 30);

        // Assert
        assertCells(assert,
            board, [
                [B, B, B, B, B, B],
                [B, B, B, B, B, B],
                [B, B, B, B, B, B],
                [B, B, B, B, B, B],
                [B, B, B, B, B, B]
            ]);
    });

QUnit.module("Nearest cells (random bombs)");
var height = 5;
var width = 6;

for (let i = 1; i < width*height; ++i) {
    QUnit.test(`When a cell contains a number, we must find this exact number of nearest cells containing a bomb: board with ${i} random bomb`,
        function(assert) {
            // Act
            const board = new ceffo.minesweeper.Board(height, width , i);

            // Assert
            assertBombsInBoard(assert, board);
        });
}

QUnit.module("getIndex", {
    beforeEach: function() {
        board = new ceffo.minesweeper.Board(5, 6, 10);
    }
});

QUnit.test("If both row and column are specified, must return the index in a flat array (stored row by row)",
    function(assert) {
        // Act
        const index = board.getIndex(2, 3);

        // Assert
        assert.strictEqual(index, 15);
    });

QUnit.test("If only row is specified (i.e. the index is already computed), return it",
    function(assert) {
        // Act
        const index = board.getIndex(2);

        // Assert
        assert.strictEqual(index, 2);
    });

QUnit.test("If none are specified, return undefined",
    function(assert) {
        // Act
        const index = board.getIndex();

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: row below",
    function(assert) {
        // Act
        const index = board.getIndex(-1, 3);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: row above",
    function(assert) {
        // Act
        const index = board.getIndex(board.height, 3);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: column below",
    function(assert) {
        // Act
        const index = board.getIndex(2, -3);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: column above",
    function(assert) {
        // Act
        const index = board.getIndex(2, board.width);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: index below",
    function(assert) {
        // Act
        const index = board.getIndex(-1);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.test("If row or column is out of range, return undefined: correct small index",
    function(assert) {
        // Act
        const index = board.getIndex(2);

        // Assert
        assert.strictEqual(index, 2);
    });

QUnit.test("If row or column is out of range, return undefined: correct large index",
    function(assert) {
        // Act
        const index = board.getIndex(board.width + 1);

        // Assert
        assert.strictEqual(index, board.width + 1);
    });

QUnit.test("If row or column is out of range, return undefined: index above",
    function(assert) {
        // Act
        const index = board.getIndex(board.width * board.height);

        // Assert
        assert.strictEqual(index, undefined);
    });

QUnit.module("cell(row,column[,value])");

QUnit.test("if row, column and value are specified, must change the value of the specified cell for the provided value and return it",
    function(assert) {
        // Arrange
        const board = new ceffo.minesweeper.Board(5, 6, 0);

        assert.strictEqual(board.cell(2, 3), undefined, "context");

        // Act
        const val = board.cell(2, 3, board.BOMB);

        // Assert
        assert.strictEqual(val, board.BOMB, "returned value");
        assert.strictEqual(board.cell(2, 3), board.BOMB, "value is set");
    });

QUnit.test("if value is not specified, must return the current value of the specified cell: nothing",
    function(assert) {
        // Arrange
        const board = new ceffo.minesweeper.Board(5, 6, 0);

        // Act
        const val = board.cell(2, 3);

        // Assert
        assert.strictEqual(val, undefined, "returned value");
    });

QUnit.test("if value is not specified, must return the current value of the specified cell: bomb",
    function(assert) {
        // Arrange
        const board = new ceffo.minesweeper.Board(5, 6, 30);

        // Act
        const val = board.cell(2, 3);

        // Assert
        assert.strictEqual(val, board.BOMB, "returned value");
    });

QUnit.test("if value is not specified, must return the current value of the specified cell: number",
    function(assert) {
        // Arrange
        const board = new ceffo.minesweeper.Board(5, 6, 0);
        board.cell(2, 2, board.BOMB);

        // Act
        const val = board.cell(2, 3);

        // Assert
        assert.strictEqual(val, 1, "returned value");
    });

QUnit.test("if no argument is specified, should return undefined",
    function(assert) {
        // Arrange
        const board = new ceffo.minesweeper.Board(5, 6, 0);

        // Act
        const val = board.cell();

        // Assert
        assert.strictEqual(val, undefined, "returned value");
    });

QUnit.module("marking", {
    beforeEach: function(assert) {
        board = new ceffo.minesweeper.Board(5, 6, 0);
        assertBoard(assert, board, 5, 6, 0);
    }
});

QUnit.test("When marking, it should return true",
    function(assert) {
        // Act
        const result = board.mark(2, 2);
        assert.strictEqual(result, true, "result");
    });
QUnit.test("When marking twice, it should return false",
    function(assert) {
        // Act
        board.mark(2, 2);
        const result = board.mark(2, 2);
        assert.strictEqual(result, false, "result");
    });

QUnit.test("When marking a cell already discovered, it should return undefined",
    function(assert) {
        // Arrange
        board.discoverCell(2, 2);

        // Act
        const res = board.mark(2, 2);
        assert.strictEqual(res, undefined, "result");
    });
