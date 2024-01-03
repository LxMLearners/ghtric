from flask_cors import CORS, cross_origin
from zipfile import ZipFile
import flask
from flask import Response, render_template, request, jsonify, json, send_from_directory
from pathlib import Path
import string

import os
import shutil
import jpype
import jpype.imports


dir_path = os.path.dirname(os.path.realpath(__file__))

if not jpype.isJVMStarted():
    jpype.startJVM(classpath=[os.path.join(dir_path, '*')])

from com.gtric.service import GTricService
from com.gtric.utils import ComposedTriclusterPattern, SingleTriclusterPattern, TriclusterStructure, OverlappingSettings
from com.gtric.generator import MixedDatasetGenerator
from com.gtric.types import Alphabet, Background, BackgroundType, TriclusterType, PatternType, Distribution, Contiguity, PlaidCoherency, TimeProfile
import java.lang


app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/assessment', methods=['GET'])
def assessment():
    return render_template('assessment.html')


def parse_tricluster_type(type: str):
    if type == "mixed":
        return TriclusterType.MIXED
    elif type == "numeric":
        return TriclusterType.NUMERIC
    else:
        return TriclusterType.SYMBOLIC


def parse_pattern_type(type: str):
    if type == "none":
        return PatternType.NONE
    elif type == "constant":
        return PatternType.CONSTANT
    elif type == "additive":
        return PatternType.ADDITIVE
    elif type == "multiplicative":
        return PatternType.MULTIPLICATIVE
    else:
        return PatternType.ORDER_PRESERVING


def parse_bkgtype_type(type: str):
    if type == "uniform":
        return BackgroundType.UNIFORM
    elif type == "discrete":
        return BackgroundType.DISCRETE
    elif type == "normal":
        return BackgroundType.NORMAL
    elif type == "missing":
        return BackgroundType.MISSING


def parse_distribution_type(type: str):
    if type == "uniform":
        return Distribution.UNIFORM
    else:
        return Distribution.DISCRETE


def parse_contiguity_type(type: str):
    if type == "none":
        return Contiguity.NONE
    elif type == "columns":
        return Contiguity.COLUMNS
    else:
        return Contiguity.CONTEXTS


def parse_plaidcoherency_type(type: str):
    if type == "additive":
        return PlaidCoherency.ADDITIVE
    elif type == "multiplicative":
        return PlaidCoherency.MULTIPLICATIVE
    elif type == "interpoled":
        return PlaidCoherency.INTERPOLED
    elif type == "none":
        return PlaidCoherency.NONE
    else:
        return PlaidCoherency.NO_OVERLAPPING


def parse_time_profile(type: str):
    if type == "random":
        return TimeProfile.RANDOM
    elif type == "monotonically_increasing":
        return TimeProfile.MONONICALLY_INCREASING
    else:
        return TimeProfile.MONONICALLY_DECREASING

def parse_probs(str_probs):
    result = jpype.JDouble[len(str_probs)]
    i = 0
    for pr in str_probs:
        result[i] = jpype.JDouble(pr)
        i += 1
    
    return result

@app.route('/teste', methods=['POST'])
def teste():
    data = json.loads(request.data)
    return data.get('teste1')


@app.route('/generate', methods=['POST'])
@cross_origin()
def generate_3way_dataset():

    service = GTricService()

    data = json.loads(request.data)

    # num rows in the dataset
    num_rows = int(data.get("num_rows"))
    # num columns in the dataset
    num_cols = int(data.get("num_cols"))
    # num contexts in the dataset
    num_conts = int(data.get("num_conts"))

    n_targets = int(data.get("num_targets"))

    imbalance = data.get("imbalance")
    imbalance = [jpype.JDouble(x) for x in imbalance]

    # num numeric columns in the dataset
    num_numeric_cols = int(data.get("num_numeric_cols"))
    # num symbolic columns in the dataset
    num_symbolic_cols = int(data.get("num_symbolic_cols"))

    # num triclusters to plant
    num_trics = int(data.get("num_trics"))

    from java.util import HashMap
    numeric_backgrounds = HashMap()
    symbolic_backgrounds = HashMap()
    numeric_alphabets = HashMap()
    symbolic_alphabets = HashMap()

    i = 0
    for alph_back in data.get("alphabets"):
        print(alph_back)
        for _ in range(int(alph_back["nrcols"])):
            if alph_back["type"] == "numeric":
                minM = float(alph_back["min"])
                maxM = float(alph_back["max"])
                real_valued = alph_back['datatype']
                real_valued = True if real_valued == "real" else False
                numeric_alphabets[jpype.JInt(i)] = Alphabet(minM, maxM, real_valued)

                numeric_background_str = alph_back["background"]
                bkg_param1_num = float(
                    alph_back["param1"]) if alph_back["param1"] != "" else 0
                bkg_param2_num = float(
                    alph_back["param2"]) if alph_back["param2"] != "" else 0
                
                bkg_param3_num = parse_probs(alph_back["param3"]) if alph_back["param3"] != "" else jpype.JDouble[1]
                bkg = Background(parse_bkgtype_type(numeric_background_str))
                bkg.setParam1(bkg_param1_num)
                bkg.setParam2(bkg_param2_num)
                bkg.setParam3(bkg_param3_num)
                numeric_backgrounds[jpype.JInt(i)] = bkg
            else:
                default_symbs = alph_back["alphabet"]
                default_symbs = True if default_symbs == "default" else False
                num_symbs = int(alph_back["num_symbs"]) if alph_back["num_symbs"] != "" else 0
                alphabet = alph_back["list_symbs"].split(",") if alph_back["list_symbs"] != "" else [str(n_i) for n_i in range(num_symbs)]
                alphabet_java = java.lang.String[len(alphabet)]
                for e in range(len(alphabet)):
                    alphabet_java[e] = alphabet[e]
                symbolic_alphabets[jpype.JInt(i)] = Alphabet(alphabet_java)

                symbolic_background_str = alph_back["background"]
                bkg_param1_symb = float(
                    alph_back["param1"]) if alph_back["param1"] != "" else 0
                bkg_param2_symb = float(
                    alph_back["param2"]) if alph_back["param2"] != "" else 0
                bkg_param3_symb = parse_probs(alph_back["param3"]) if alph_back["param3"] != "" else jpype.JDouble[1]
                bkg = Background(parse_bkgtype_type(symbolic_background_str))
                bkg.setParam1(bkg_param1_symb)
                bkg.setParam2(bkg_param2_symb)
                bkg.setParam3(bkg_param3_symb)
                symbolic_backgrounds[jpype.JInt(i)] = bkg
            i += 1

    dataset_type = data.get("dataset_type").capitalize()
    service.setDatasetType(dataset_type)
    if dataset_type == 'Numeric':
        num_alph = numeric_alphabets[jpype.JInt(0)]
        num_bkg = numeric_backgrounds[jpype.JInt(0)]
        service.setDatasetProperties(num_rows, num_cols, num_conts, num_alph.isRealValued(), num_alph.getMinM(), num_alph.getMaxM(),
                                     data.get("alphabets")[0]["background"].capitalize(), num_bkg.getParam1(), num_bkg.getParam2(), num_bkg.getParam3(), n_targets, imbalance)
    elif dataset_type == 'Symbolic':
        sym_alph = data.get("alphabets")[0]
        default_symbs = sym_alph["alphabet"]
        default_symbs = True if default_symbs == "default" else False
        num_symbs = int(sym_alph["num_symbs"]) if sym_alph["num_symbs"] != "" else 0

        alphabet = sym_alph["list_symbs"].split(",") if "," in sym_alph["list_symbs"] else []
        alphabet_java = java.lang.String[len(alphabet)]
        for e in range(len(alphabet)):
            alphabet_java[e] = alphabet[e]
        symbolic_background_str = sym_alph["background"].capitalize()
        bkg_param1_symb = float(sym_alph["param1"]) if sym_alph["param1"] != "" else 0
        bkg_param2_symb = float(sym_alph["param2"]) if sym_alph["param2"] != "" else 0
        bkg_param3_symb = parse_probs(sym_alph["param3"]) if sym_alph["param3"] != "" else jpype.JDouble[1]

        service.setDatasetProperties(num_rows, num_cols, num_conts, default_symbs, num_symbs, alphabet,
                                     symbolic_background_str, bkg_param1_symb, bkg_param2_symb, bkg_param3_symb, n_targets, imbalance)
    else:
        cols_ratio = num_numeric_cols / num_cols
        service.setDatasetProperties(num_rows, num_cols, num_conts, cols_ratio, numeric_backgrounds, symbolic_backgrounds, 
                                      numeric_alphabets, symbolic_alphabets, n_targets, imbalance)

    dist_rows = data.get("tric_rows_dist").capitalize()
    min_dist_rows = float(data.get("min_dist_rows"))
    max_dist_rows = float(data.get("max_dist_rows"))
    mean_dist_rows = float(data.get("mean_dist_rows"))
    std_dist_rows = float(data.get("std_dist_rows"))
    row_dist_param1 = min_dist_rows if dist_rows == "Uniform" else mean_dist_rows
    row_dist_param2 = max_dist_rows if dist_rows == "Uniform" else std_dist_rows

    dist_cols = data.get("tric_cols_dist").capitalize()
    min_dist_cols = float(data.get("min_dist_cols"))
    max_dist_cols = float(data.get("max_dist_cols"))
    mean_dist_cols = float(data.get("mean_dist_cols"))
    std_dist_cols = float(data.get("std_dist_cols"))
    cols_dist_param1 = min_dist_cols if dist_cols == "Uniform" else mean_dist_cols
    cols_dist_param2 = max_dist_cols if dist_cols == "Uniform" else std_dist_cols
    
    dist_symb_cols = data.get("htric_scols_dist").capitalize()
    min_dist_symb_cols = float(data.get("min_dist_scols"))
    max_dist_symb_cols = float(data.get("max_dist_scols"))
    mean_dist_symb_cols = float(data.get("mean_dist_scols"))
    std_dist_symb_cols = float(data.get("std_dist_scols"))
    symb_cols_dist_param1 = min_dist_symb_cols if dist_symb_cols == "Uniform" else mean_dist_symb_cols
    symb_cols_dist_param2 = max_dist_symb_cols if dist_symb_cols == "Uniform" else std_dist_symb_cols

    dist_num_cols = data.get("htric_ncols_dist").capitalize()
    min_dist_num_cols = float(data.get("min_dist_ncols"))
    max_dist_num_cols = float(data.get("max_dist_ncols"))
    mean_dist_num_cols = float(data.get("mean_dist_ncols"))
    std_dist_num_cols = float(data.get("std_dist_ncols"))
    num_cols_dist_param1 = min_dist_num_cols if dist_num_cols == "Uniform" else mean_dist_num_cols
    num_cols_dist_param2 = max_dist_num_cols if dist_num_cols == "Uniform" else std_dist_num_cols

    dist_conts = data.get("tric_conts_dist").capitalize()
    min_dist_conts = float(data.get("min_dist_conts"))
    max_dist_conts = float(data.get("max_dist_conts"))
    mean_dist_conts = float(data.get("mean_dist_conts"))
    std_dist_conts = float(data.get("std_dist_conts"))
    conts_dist_param1 = min_dist_conts if dist_conts == "Uniform" else mean_dist_conts
    conts_dist_param2 = max_dist_conts if dist_conts == "Uniform" else std_dist_conts

    contiguity = data.get("contiguity").capitalize()

    if dataset_type == 'Heterogeneous':
        service.setTriclustersProperties(num_trics, 
                                         dist_rows, row_dist_param1, row_dist_param2, 
                                         dist_symb_cols, symb_cols_dist_param1, symb_cols_dist_param2, 
                                         dist_num_cols, num_cols_dist_param1, num_cols_dist_param2,
                                         dist_conts, conts_dist_param1, conts_dist_param2,
                                         contiguity)
    else:
        service.setTriclustersProperties(num_trics, 
                                         dist_rows, row_dist_param1, row_dist_param2, 
                                         dist_cols, cols_dist_param1, cols_dist_param2, 
                                         dist_conts, conts_dist_param1, conts_dist_param2,
                                         contiguity)
        

    patterns_list = data.get("patterns")
    from java.util import ArrayList
    patterns = ArrayList()

    for p in patterns_list:
        p_type = (java.lang.String) @ string.capwords(p["type"])
        p_rows = (java.lang.String) @ string.capwords(p["p_rows"])
        p_cols = (java.lang.String) @ string.capwords(p["p_cols"])
        p_conts = (java.lang.String) @ string.capwords(p["p_conts"])
        time_prf = (java.lang.String) @ p["time_prf"]

        if len(time_prf) == 0:
            pattern = GTricService.TriclusterPatternWrapper(
                service, p_type, p_rows, p_cols, p_conts, java.lang.String@None)
        else:
            time_prf = (java.lang.String) @ string.capwords(p["time_prf"])
            pattern = GTricService.TriclusterPatternWrapper(
                service, p_type, p_rows, p_cols, p_conts, time_prf, java.lang.String@None)

        patterns.add(pattern)

    service.setTriclusterPatterns(patterns, dataset_type)

    service.setOverlappingSettings(data.get("plaid_coherency").capitalize(),
                                   float(data.get("overlapping_perc_trics"))/100,
                                   int(data.get("max_trics_overlapped_area")),
                                   float(data.get("perc_overlapped_elems"))/100,
                                   float(data.get("perc_overlap_rows"))/100,
                                   float(data.get("perc_overlap_cols"))/100,
                                   float(data.get("perc_overlap_conts"))/100)

    service.setQualitySettings(float(data.get("missing_perc_bckg"))/100,
                               float(data.get("missing_perc_plant_trics"))/100,
                               float(data.get("noise_perc_bckg"))/100,
                               float(data.get("noise_perc_plant_trics"))/100,
                               float(data.get("noise_deviation")),
                               float(data.get("error_perc_bckg"))/100,
                               float(data.get("error_perc_plant_trics"))/100)

    rand_seed = True if data.get("rand_seed") == "yes" else False
    if rand_seed:
        service.initializeRandom(int(data.get("seed")))

    # Define the directory name
    directory_name = f"{data.get('filename')}_files/"
    Path(directory_name).mkdir(parents=True, exist_ok=True)
    # os.mkdir(directory_name)
    service.setPath(directory_name)
    single_file = True if data.get("save_on") == "one" else False
    service.setSingleFileOutput(single_file)
    service.setFilename(data.get("filename"))
    if dataset_type == 'Numeric':
        service.generateNumericDataset()
        # service.saveResult(service.getGeneratedDataset(), "example_trics", "example_dataset")
    elif dataset_type == 'Symbolic':
        service.generateSymbolicDataset()
        # service.saveResult(service.getGeneratedDataset(), "example_trics", "example_dataset")
    else:
        service.generateHeterogeneousDataset()
        # service.saveHeterogeneousResult(service.getGeneratedDataset(), "example_trics", "example_dataset")

        # create a ZipFile object
    zipObj = ZipFile(f'{directory_name}/data.zip', 'w')
    # Add multiple files to the zip
    zipObj.write(f'{directory_name}/{data.get("filename")}_trics.txt')
    zipObj.write(f'{directory_name}/{data.get("filename")}_trics.json')
    zipObj.write(f'{directory_name}/{data.get("filename")}_data.tsv')
    # close the Zip File
    zipObj.close()

    return {"dir_name": directory_name}
    # # file_path = f'/Users/diogosoares/Documents/repos_generators/G-TricH-app/temps/{data.get("filename")}_trics.txt'
    # return send_from_directory(directory='temps', path='temp.zip', as_attachment=True)
    # return send_file(file_path, as_attachment=True, download_name=data.get("filename"))


@app.route("/download_file")
@cross_origin()
def download():
    data = request.args.to_dict()
    dir_name = data["dir_name"]
    zip_to_send = open(f"{dir_name}/data.zip", 'rb').readlines()
    shutil.rmtree(dir_name)
    return Response(zip_to_send, headers={
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=%s;' % f"{dir_name}/data.zip"
    })


def process_solution_dict(trics_dict, triclusters_key="Triclusters"):
    gt = dict()
    for t_id in trics_dict[triclusters_key]:
        try:
            gt[int(t_id)] = [trics_dict[triclusters_key][t_id]['X'],
                             trics_dict[triclusters_key][t_id]['Y'], trics_dict[triclusters_key][t_id]['Z']]
        except KeyError:
            gt[int(t_id)] = [trics_dict[triclusters_key][t_id]['X'],
                             trics_dict[triclusters_key][t_id]['SymbolicY'] +
                             trics_dict[triclusters_key][t_id]['NumericY'],
                             trics_dict[triclusters_key][t_id]['Z']]
    return gt


@app.route("/evaluate", methods=['POST'])
def evaluate():
    data = json.loads(request.data)
    hetero = True if data['Type'] == "heterogeneous" else False
    solution = data['Solution']

    hetero_types = ["NumericTriclusters",
                    "SymbolicTriclusters", "MixedTriclusters"]
    results_final = dict()

    if hetero:
        for ht in hetero_types:
            solution_p = process_solution_dict(data['Solution'], ht)
            ground_truth_p = process_solution_dict(data['GroundTruth'], ht)
            print("S", solution_p)
            print("GT", ground_truth_p)

            results = dict()

            results["Recoverability"] = t_eval.Recoverability(
                ground_truth_p, solution_p)

            results["ClusteringError3D"] = t_eval.ClusteringError3D(ground_truth_p, solution_p, solution['#DatasetRows'],
                                                                    solution['#DatasetColumns'],
                                                                    solution['#DatasetContexts'])
            results["RMS3"] = t_eval.RMS3(ground_truth_p, solution_p)
            print(results)
            results_final[ht] = results
    else:
        solution_p = process_solution_dict(data['Solution'])
        ground_truth_p = process_solution_dict(data['GroundTruth'])

        results = dict()

        results["Recoverability"] = t_eval.Recoverability(
            ground_truth_p, solution_p)
        results["ClusteringError3D"] = t_eval.ClusteringError3D(ground_truth_p, solution_p, solution['#DatasetRows'],
                                                                solution['#DatasetColumns'],
                                                                solution['#DatasetContexts'])
        results["RMS3"] = t_eval.RMS3(ground_truth_p, solution_p)
        results_final["Triclusters"] = results

    return results_final


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080)
