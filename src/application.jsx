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
      files: []
    };
  }

  update() {
    FS.enumFiles(this.props.baseDir, /\.jpg/i).then((files)=>{
      this.setState({files: files});
    });
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
    return (<div className={'imageCells ' + this.props.display}>{cells}</div>);
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

  onClick(selectedKey) {
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

  render() {
    var elm = Object.keys(this.state).map((key)=>{
      return (<Button key={key} active={this.state[key]} onClick={()=>{this.onClick(key)}}>{this.labels[key]}</Button>)
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
      display: ""
    }
  }

  updateDisplay(newDisplay) {
    this.setState({display: newDisplay});
  }

  render() {
    return (
      <div>
        <Navigation baseDir={this.props.baseDir} updateDisplay={(stat)=>{this.updateDisplay(stat)}}/>
        <Images baseDir={this.props.baseDir} display={this.state.display}/>
      </div>
    );
  }
}




ReactDOM.render(
  (<Application baseDir='/Volumes/JetDrive330/OLYMPUS Viewer 3'/>),
  document.getElementById('application')
);
