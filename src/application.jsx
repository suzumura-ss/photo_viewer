const React = require('react');
const ReactDOM = require('react-dom');
const ExifReader = require(__dirname + '/js/exifreader');
const FS = require('fs');
const Sugar = require('Sugar');
Sugar.extend();

require(__dirname + '/js/fs-ext').extend(FS);

const {Image, Photo, Thumbnail, Preview} = require(__dirname + '/js/image');


class ImageCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {exif: {}};
    Image.findOrCreateWithFile(props.fileName).then((result)=>{
      const exif = result[0].dataValues,
            thumb = result[1].dataValues;
      exif.ThumbnailImage = thumb.Image;
      this.setState({exif: exif});
    });
  }

  render() {
    if (!this.state.exif.ThumbnailImage) {
      return (<div className='imageCell' />);
    }
    var klass = '';
    if (this.state.exif.Orientation) {
      klass = 'orientation-' + this.state.exif.Orientation.replace(/[()]/g, '').split(' ')[1];
    }
    return (
      <div className='imageCell'>
        <img className={klass} src={this.state.exif.ThumbnailImage} />
        <ImageCell.Exif exif={this.state.exif} />
      </div>
    );
  }
}


ImageCell.Exif = class extends React.Component {
  render() {
    const ExifProcs = {
      FileName:     (v)=>{ return v },
      LensID:       (v)=>{ return v },
      FNumber:      (v)=>{ return 'F'+v },
      FocalLength:  (v)=>{ return v },
      ShutterSpeed: (v)=>{ return v },
      ISO:          (v)=>{ return 'ISO ' + v },
      ExposureCompensation: (v)=>{ return 'EV ' + parseFloat(v).toFixed(1) },
      DateTimeOriginal: (v)=>{ return v.toLocaleDateString() + ' ' + v.toLocaleTimeString() }
    }
    var elm = Object.keys(ExifProcs).map((key)=>{
      return (<li key={key} className={key}>{ExifProcs[key](this.props.exif[key])}</li>);
    });
    return (<ul>{elm}</ul>);
  }
}


class Images extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      display: ""
    };
  }

  update() {
    FS.enumFiles(this.props.baseDir, /\.jpg/i).then((files)=>{
      this.setState({files: files});
    });
  }

  clear() {
    this.setState({files:[]})
  }

  render() {
    let cells;
    if (this.state.files.isEmpty()) {
      this.update();
      cells = '';
    } else {
      cells = this.state.files.map((path)=>{
        return (<ImageCell key={path} fileName={path} />);
      });
    }
    return (<div className={'imageCells ' + this.state.display}>{cells}</div>);
  }
}


const {Navbar, Nav, FormGroup, FormControl, Button} =require('react-bootstrap');

class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      FileName: true,
      LensID: true,
      FNumber: true,
      FocalLength: true,
      ShutterSpeed: true,
      ISO: true,
      ExposureCompensation: true,
      DateTimeOriginal: true
    }
    this.labels = {
      FileName: "Name",
      LensID: "LensID",
      FNumber: "F",
      FocalLength: "F.Length",
      ShutterSpeed: "S.Speed",
      ISO: "ISO",
      ExposureCompensation: "EV",
      DateTimeOriginal: "Date"
    }
  }

  toggleState(selectedKey) {
    var display = Object.keys(this.state).map((key)=>{
      if ((key===selectedKey &&  this.state[key]) || (key!==selectedKey && !this.state[key])) {
        return key + "-hide";
      }
      return "";
    }).join(' ').trim();
    this.props.updateDisplay(display);
    this.setState((prevState, props)=>{
      var obj = {}
      obj[selectedKey] = !prevState[selectedKey];
      return obj;
    });
  }

  reload() {
    this.props.theApp.reload();
  }

  render() {
    var elm = Object.keys(this.state).map((key)=>{
      return (<Button key={key} active={this.state[key]} onClick={()=>{this.toggleState(key)}}>{this.labels[key]}</Button>)
    });

    const Navigation_inctance = (
      <Navbar fixedTop={true}>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">{this.props.baseDir.split('/').last()}</a>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Collapse>
          <Navbar.Form pullLeft>
            <FormGroup>
              {elm}
              <Button onClick={()=>{this.reload()}}>Reload</Button>
            </FormGroup>
          </Navbar.Form>
        </Navbar.Collapse>
      </Navbar>
    );
    return Navigation_inctance;
  }
}


class Application extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseDir: this.props.initialBaseDir
    }
  }

  updateDisplay(display) {
    this.refs.images.setState({display});
  }

  reload(baseDir) {
    if (!baseDir) {
      baseDir = this.state.baseDir;
    }
    this.refs.images.clear();
    this.setState({baseDir})
  }

  render() {
    return (
      <div>
        <Navigation
          baseDir={this.state.baseDir}
          updateDisplay={(stat)=>{this.updateDisplay(stat)}}
          theApp={this}
          ref="navigation"
        />
        <Images
          baseDir={this.state.baseDir}
          ref="images"
          />
      </div>
    );
  }
}




ReactDOM.render(
  (<Application initialBaseDir='/Volumes/JetDrive330/OLYMPUS Viewer 3/2016_09_22'/>),
  document.getElementById('application')
);
