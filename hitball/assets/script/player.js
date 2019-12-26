
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

        var num = cc.storage.getGameNum();
        if(num>=cc.config.ranges.length)num = cc.config.ranges.length-1;
        var conf = cc.config.ranges[num];

        var dis = this.game.ball.position.sub(this.game.tarpos).mag();
        var rate = -(100-dis)/100*3;
        if(this.game.playerId == 34 || this.game.playerId == 35)
        {
            if(dis<conf.hit3)
            {
                cc.log("hitBall 3");
                rate = -0.3;
                cc.res.setSpriteFrame("images/game/ball34",this.game.ball);
                var body = this.game.ball.getComponent(cc.RigidBody);
                body.linearVelocity = body.linearVelocity.mul(rate);
                this.game.showHit(3);
            }
            else
            {
                this.game.showHit(4);
                cc.log("hitBall 0000");
            }
            return;
        }
        else if(this.game.playerId == 36)
        {
            if(dis<conf.hit1)
            {
                cc.log("hitBall 1");
                this.game.ball.destroy();
                var anim = cc.instantiate(cc.res["prefab_anim_player36_boom"]);
                anim.position = this.game.ball.position;
                anim.parent = this.game.ball.parent;
                anim.runAction(cc.sequence(cc.delayTime(0.5),cc.removeSelf()));
                this.game.showHit(1);
                cc.storage.playSound("audio/player36_boom");
            }
            else if(dis<conf.hit2)
            {
                cc.log("hitBall 2");
                var body = this.game.ball.getComponent(cc.RigidBody);
                body.linearVelocity = body.linearVelocity.mul(rate);
                this.game.showHit(2);
            }
            else if(dis<conf.hit3)
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
            return;
        }

        if(dis<conf.hit1)
        {
            cc.log("hitBall 1");
            var body = this.game.ball.getComponent(cc.RigidBody);
            body.linearVelocity = body.linearVelocity.mul(rate);
            this.game.showHit(1);
        }
        else if(dis<conf.hit2)
        {
            cc.log("hitBall 2");
            var body = this.game.ball.getComponent(cc.RigidBody);
            body.linearVelocity = body.linearVelocity.mul(rate);
            this.game.showHit(2);
        }
        else if(dis<conf.hit3)
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
