
import Component from "./Component"
import Point from "../geom/Point"

export default class DragHandler extends Component {

    static MAX_VEL_FRAMES = 2;

    private dragging : boolean;

    mouseVelocity : Point = new Point(0, 0);
    lastVelocities : Point[] = [];
    lastPos : Point = new Point(0, 0);

    throwable : boolean;

    onDragStart() {}
    onDrag() {}
    onDragEnd() {}

    constructor(params) {
        super("draghandler", "draghandler", params);
    }

    onObjDragStart(game) {
        this.dragging = true;
        this.lastPos = this.gameObject.pos;
        this.lastVelocities = [];
    }

    onObjDrag(game) {

        this.gameObject.pos = game.screenCoordToWorld(game.mousePos);

        var frameVel = this.gameObject.pos.subtract(this.lastPos);
        this.lastVelocities.push(frameVel);

        if (this.lastVelocities.length > DragHandler.MAX_VEL_FRAMES) {
            this.lastVelocities.shift();
        }

        this.mouseVelocity = new Point(0, 0);
        for (var i = 0; i < this.lastVelocities.length; i++) {
            this.mouseVelocity = this.mouseVelocity.add(this.lastVelocities[i]);
        }
        this.mouseVelocity = this.mouseVelocity.scale(game.timeDelta/(this.lastVelocities.length));

        this.lastPos = this.gameObject.pos;
    }

    onObjDragEnd(game) {
        
        if (this.throwable) {
            var physicsBody = this.gameObject.getComponent('physicsbody');
            if (physicsBody && physicsBody.bodyType === 'dynamic') {
                this.gameObject.speed = this.mouseVelocity;
            }
        }
        this.dragging = false;
    }

    onAdd(game, gameObject) {
        gameObject.onDragStart = this.onObjDragStart.bind(this);
        gameObject.onDrag = this.onObjDrag.bind(this);
        gameObject.onDragEnd = this.onObjDragEnd.bind(this);
        this.lastPos = gameObject.pos;
    }

    toJSON(smartSerialize = false, isRoot = false, variables = {}, blockWarning=false) {
        return super.toJSON(smartSerialize, isRoot, variables, blockWarning, ['dragging', 'mouseVelocity', 'lastVelocities', 'lastPos'])
    }

    static fromJSON(json) {
        var obj = (typeof json) == 'string' ? JSON.parse(json) : json;

        return new DragHandler(obj);
    }

}


Component.registerComponent('draghandler', DragHandler);