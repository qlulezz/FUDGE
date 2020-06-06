namespace MatrixTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;


  let coSys: ƒ.Node[] = [];
  let viewport: ƒ.Viewport = new ƒ.Viewport();
  let root: ƒ.Node = new ƒ.Node("Root");

  window.addEventListener("load", init);

  function init(_event: Event): void {
    for (let i: number = 0; i < 2; i++) {
      coSys.push(new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.IDENTITY()));
      root.addChild(coSys[i]);
      createUI(i);
    }
    document.querySelector("fieldset#Hierarchy").addEventListener("change", hndHierarchy);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 2));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 5);
  }

  function animate(): void {
    for (let i: number = 0; i < 2; i++) {
      displayMatrix(i, coSys[i].mtxLocal);
      move(i);
    }
    viewport.draw();
  }


  function move(_which: number): void {
    let fieldset: HTMLFieldSetElement = document.querySelector("fieldset#Interact" + _which);
    let formData: FormData = new FormData(fieldset.querySelector("form"));
    // console.log(formData.get("t").valueOf(), formData.get("tValue"), formData.get("tDirection"));
    // console.log(formData.get("r"), formData.get("rValue"), formData.get("rDirection"));
    // console.log(formData.get("s"), formData.get("sValue"), formData.get("sDirection"));

    let translate: ƒ.Vector3 = calcVector(String(formData.get("t")), Number(formData.get("tValue")), Number(formData.get("tDirection")));
    let rotate: ƒ.Vector3 = calcVector(String(formData.get("r")), Number(formData.get("rValue")), Number(formData.get("rDirection")));
    let scale: ƒ.Vector3 = calcVector(String(formData.get("s")), Number(formData.get("sValue")), Number(formData.get("sDirection")));

    coSys[_which].mtxLocal.translate(translate);
    coSys[_which].mtxLocal.rotate(rotate, false);
    scale.add(ƒ.Vector3.ONE());
    coSys[_which].mtxLocal.scale(scale);
  }


  function createUI(_which: number): void {
    let fieldset: HTMLFieldSetElement;
    fieldset = document.querySelector("fieldset#Matrix" + _which);
    let element: number = 0;
    for (let prefix of ["X", "Y", "Z", "T"])
      for (let postfix of ["x", "y", "z", "w"]) {
        fieldset.innerHTML += `<span>${prefix}${postfix}&nbsp;<input id='m${element}' type='number' disabled /></span>`;
        if (++element % 4 == 0)
          fieldset.innerHTML += "<br />";
      }

    fieldset = document.querySelector("fieldset#Interact" + _which);
    let table: string = "<form><table>";
    for (let transform of ["t", "r", "s"]) {
      let step: number = transform == "r" ? 1 : 0.1;
      let value: number = 0;
      table += `<tr><th>${transform}</th>`;
      for (let dimension of ["x", "y", "z"]) {
        let id: string = transform + dimension;
        // fieldset.innerHTML += `<span>${id} <input id='${id}' type='number' step='0.1'/><button>+</button><button>-</button></span>`;
        table += `<td><input type="radio" name="${transform}" value="${dimension}" id="${id}" ${dimension == "x" ? "checked" : ""}></input>`;
        table += `<label for="${id}">${dimension}</label></td>`;
      }
      table += `<td><input type="number" name="${transform}Value" step="${step}" value="${value}"></input></td>`;
      table += `<td><input type="range" name="${transform}Direction" step="1" value="0" min="-1" max="1"></input></td>`;
      table += "</tr>";
    }
    table += "</table></form>";
    console.log(table);
    fieldset.innerHTML += table;


    fieldset.addEventListener("keyup", hndKey);
    fieldset.addEventListener("keydown", hndKey);
  }

  async function hndKey(_event: ƒ.EventKeyboard): Promise<void> {
    let slider: HTMLInputElement = <HTMLInputElement>_event.target;
    if (slider.type != "range")
      return;
    if (_event.code != ƒ.KEYBOARD_CODE.ARROW_LEFT && _event.code != ƒ.KEYBOARD_CODE.ARROW_RIGHT)
      return;

    if (_event.type == "keyup")
      slider.value = "0";
    else {
      ƒ.Loop.stop();
      window.setTimeout(tick, 10);
    }
  }

  async function tick(): Promise<void> {
    animate();
    await ƒ.Time.game.delay(100);
    ƒ.Loop.continue();
  }

  function hndHierarchy(_event: Event): void {
    let hierarchy: number = Number((<HTMLInputElement>_event.target).value);
    switch (hierarchy) {
      case 0:
        root.appendChild(coSys[0]);
        coSys[0].appendChild(coSys[1]);
        break;
      case 1:
        root.appendChild(coSys[1]);
        coSys[1].appendChild(coSys[0]);
        break;
      default:
        root.appendChild(coSys[0]);
        root.appendChild(coSys[1]);
        break;
    }
  }

  // function isAbsolute(): boolean {
  //   return (<HTMLInputElement>document.querySelector("#absolute")).checked;
  // }

  // function interactAbsolute(_input: HTMLInputElement): void {
  //   let vectors: ƒ.Vector3[] = [];
  //   for (let transform of ["t", "r", "s"]) {
  //     let vector: ƒ.Vector3 = new ƒ.Vector3();
  //     for (let dimension of ["x", "y", "z"]) {
  //       let id: string = transform + dimension;
  //       let input: HTMLInputElement = <HTMLInputElement>document.querySelector("#" + id);
  //       vector[dimension] = parseFloat(input.value);
  //     }
  //     vectors.push(vector);
  //   }
  //   setTransform(vectors);
  // }

  // function setTransform(_vectors: ƒ.Vector3[]): void {
  //   let matrix: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY();
  //   matrix.translate(_vectors[0]);
  //   matrix.rotateZ(_vectors[1].z);
  //   matrix.rotateY(_vectors[1].y);
  //   matrix.rotateX(_vectors[1].x);
  //   matrix.scale(_vectors[2]);

  //   coSys.mtxLocal.set(matrix);
  // }

  // function interactRelative(_input: HTMLInputElement, _factor: number): void {

  //   switch (_input.id[0]) {
  //     case "t":
  //       translate(_input, _factor);
  //       break;
  //     case "s":
  //       scale(_input, _factor);
  //       break;
  //     case "r":
  //       rotate(_input, _factor);
  //       break;
  //   }
  // }

  // function translate(_input: HTMLInputElement, _factor: number): void {
  //   let vector: ƒ.Vector3 = calcInputVector(_input, _factor);
  //   // vector.scale(0.1);
  //   coSys.mtxLocal.translate(vector);
  // }
  // function scale(_input: HTMLInputElement, _factor: number): void {
  //   let vector: ƒ.Vector3 = calcInputVector(_input, _factor);
  //   // vector.scale(0.1);
  //   vector.add(new ƒ.Vector3(1, 1, 1));
  //   coSys.mtxLocal.scale(vector);
  // }
  // function rotate(_input: HTMLInputElement, _factor: number): void {
  //   let vector: ƒ.Vector3 = calcInputVector(_input, _factor);
  //   // vector.scale(5);
  //   coSys.mtxLocal.rotateY(vector.y);
  //   coSys.mtxLocal.rotateX(vector.x);
  //   coSys.mtxLocal.rotateZ(vector.z);
  // }

  function calcVector(_dimension: string, _value: number, _factor: number): ƒ.Vector3 {
    let vector: ƒ.Vector3 = new ƒ.Vector3();
    vector[_dimension] = _factor * _value;
    return vector;
  }

  function displayMatrix(_which: number, _matrix: ƒ.Matrix4x4): void {
    let fieldset: HTMLFieldSetElement = document.querySelector("fieldset#Matrix" + _which);
    let data: Float32Array = _matrix.get();
    for (let index in data) {
      let input: HTMLInputElement = fieldset.querySelector("#m" + index);
      input.value = data[index].toFixed(2);
    }
  }
  // function displayVectors(_matrix: ƒ.Matrix4x4): void {
  //   let vectors: ƒ.Vector3[] = [_matrix.translation, _matrix.rotation, _matrix.scaling];
  //   for (let transform of ["t", "r", "s"]) {
  //     let vector: ƒ.Vector3 = vectors.shift();
  //     for (let dimension of ["x", "y", "z"]) {
  //       let id: string = transform + dimension;
  //       let input: HTMLInputElement = document.querySelector("#" + id);
  //       input.value = vector[dimension].toFixed(2);
  //     }
  //   }
  // }
}