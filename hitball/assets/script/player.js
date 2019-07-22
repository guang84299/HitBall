
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function()
    {
        this.game = cc.find("Canvas").getComponent("game");
    },

    hitBall: function()
    {
        if(!this.game) return;

        var dis = this.game.ball.position.sub(this.game.tarpos).mag();
        var rate = -(80-dis)/80*3;
        if(dis<20)
        {
            cc.log("hitBall 1");
            var body = this.game.ball.getComponent(cc.RigidBody);
            body.linearVelocity = body.linearVelocity.mul(rate);
            this.game.showHit(1);
        }
        else if(dis<40)
        {
            cc.log("hitBall 2");
            var body = this.game.ball.getComponent(cc.RigidBody);
            body.linearVelocity = body.linearVelocity.mul(rate);
            this.game.showHit(2);
        }
        else if(dis<80)
        {
            cc.log("hitBall 3");
            if(rate>-0.3) rate = 0.3;
            var body = this.game.ball.getComponent(cc.RigidBody);
            body.linearVelocity = body.linearVelocity.mul(rate);
            this.game.showHit(3);
        }
        else
        {
            this.game.showHit(4);
            cc.log("hitBall 0000");
        }
    },

    hitEnd: function()
    {
        this.node.state = "end";
        cc.log("hitEnd");
    }
});
