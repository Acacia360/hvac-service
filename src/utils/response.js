function ok(res, data)              { res.json({ success: true, ...data }); }
function fail(res, msg, code = 500) { res.status(code).json({ success: false, error: msg }); }

function asyncRoute(fn) {
    return (req, res, next) => fn(req, res).catch(next);
}

module.exports = { ok, fail, asyncRoute };
