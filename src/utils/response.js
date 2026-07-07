function ok(res, data)              { res.json({ success: true, ...data }); }
function fail(res, msg, code = 500) { res.status(code).json({ success: false, error: msg }); }

function asyncRoute(fn) {
    return (req, res) => fn(req, res).catch(err => fail(res, err.message));
}

module.exports = { ok, fail, asyncRoute };
